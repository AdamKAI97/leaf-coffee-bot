import { Router } from "express";
import { Markup } from "telegraf";
import { prisma } from "../prisma";

export const ordersRouter = Router();

type IncomingItem = {
  menuItemId: number;
  qty: number;
  variantOptionIds: number[];
};

function branchNameRu(branch: { nameRu: string }) {
  return branch.nameRu;
}

ordersRouter.post("/", async (req, res) => {
  const {
    branchId,
    orderType,
    deliveryAddress,
    telegramId,
    telegramUsername,
    telegramFirstName,
    language,
    items,
  } = req.body as {
    branchId: number;
    orderType: "PICKUP" | "DELIVERY";
    deliveryAddress?: string;
    telegramId: number;
    telegramUsername?: string;
    telegramFirstName?: string;
    language: "RU" | "UZ" | "EN";
    items: IncomingItem[];
  };

  if (!branchId || !telegramId || !orderType || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "branchId, orderType, telegramId and items are required" });
  }
  if (orderType === "DELIVERY" && !deliveryAddress?.trim()) {
    return res.status(400).json({ error: "deliveryAddress is required for delivery orders" });
  }

  const branch = await prisma.branch.findUnique({ where: { id: Number(branchId) } });
  if (!branch) return res.status(404).json({ error: "branch not found" });

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i) => Number(i.menuItemId)) } },
    include: { variantGroups: { include: { variantGroup: { include: { options: true } } } } },
  });
  const menuItemById = new Map(menuItems.map((m) => [m.id, m]));

  let total = 0;
  const orderItemsData: any[] = [];

  for (const line of items) {
    const menuItem = menuItemById.get(Number(line.menuItemId));
    if (!menuItem) return res.status(400).json({ error: `menu item ${line.menuItemId} not found` });

    const validOptionIds = new Set(
      menuItem.variantGroups.flatMap((g) => g.variantGroup.options.map((o) => o.id))
    );
    const selectedOptionIds = (line.variantOptionIds || []).filter((id) => validOptionIds.has(id));
    const delta = menuItem.variantGroups.reduce((sum, g) => {
      const opt = g.variantGroup.options.find((o) => selectedOptionIds.includes(o.id));
      return sum + (opt?.priceDelta ?? 0);
    }, 0);

    const unitPrice = menuItem.basePrice + delta;
    const qty = Math.max(1, Number(line.qty) || 1);
    total += unitPrice * qty;

    orderItemsData.push({
      menuItemId: menuItem.id,
      quantity: qty,
      unitPrice,
      variants: { create: selectedOptionIds.map((variantOptionId) => ({ variantOptionId })) },
    });
  }

  const customer = await prisma.customer.upsert({
    where: { telegramId: BigInt(telegramId) },
    update: {},
    create: { telegramId: BigInt(telegramId), language },
  });

  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      branchId: branch.id,
      type: orderType,
      paymentMethod: "CASH",
      deliveryAddress: orderType === "DELIVERY" ? deliveryAddress?.trim() : null,
      totalPrice: total,
      language,
      items: { create: orderItemsData },
      statusLog: { create: { status: "CREATED" } },
    },
    include: { items: { include: { menuItem: true, variants: { include: { variantOption: true } } } } },
  });

  const staffChatId = process.env.TELEGRAM_ORDERS_CHAT_ID;
  if (staffChatId && process.env.TELEGRAM_BOT_TOKEN) {
    const { bot } = await import("../bot");
    const who = telegramUsername ? `@${telegramUsername}` : telegramFirstName || "Гость";
    const lines = order.items
      .map((oi) => {
        const variants = oi.variants.map((v) => v.variantOption.nameRu).join(", ");
        return `• ${oi.menuItem.nameRu}${variants ? ` (${variants})` : ""} x${oi.quantity} — ${oi.unitPrice * oi.quantity} сум`;
      })
      .join("\n");
    const typeText =
      orderType === "PICKUP" ? "Самовывоз" : `Доставка: ${order.deliveryAddress}`;

    await bot.telegram.sendMessage(
      staffChatId,
      `🧾 Новый заказ #${order.id}\nФилиал: ${branchNameRu(branch)}\n${typeText}\nГость: ${who}\n\n${lines}\n\nИтого: ${total} сум\nОплата: наличными при получении`,
      Markup.inlineKeyboard([Markup.button.callback("✅ Принять заказ", `orderack:${order.id}`)])
    );
  }

  res.json({ status: "ok", orderId: order.id, total });
});
