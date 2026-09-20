import { Router } from "express";
import { prisma } from "../prisma";
import { buildOrderMessageText, buildOrderKeyboard } from "../orderMessage";

export const ordersRouter = Router();

ordersRouter.get("/", async (req, res) => {
  const telegramId = req.query.telegramId;
  if (!telegramId) return res.status(400).json({ error: "telegramId is required" });

  const customer = await prisma.customer.findUnique({ where: { telegramId: BigInt(String(telegramId)) } });
  if (!customer) return res.json([]);

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      branch: true,
      items: { include: { menuItem: true, variants: { include: { variantOption: true } } } },
    },
  });

  res.json(orders);
});

type IncomingItem = {
  menuItemId: number;
  qty: number;
  variantOptionIds: number[];
};

ordersRouter.post("/", async (req, res) => {
  const {
    branchId,
    orderType,
    deliveryAddress,
    deliveryLatitude,
    deliveryLongitude,
    comment,
    telegramId,
    telegramUsername,
    telegramFirstName,
    language,
    items,
  } = req.body as {
    branchId: number;
    orderType: "PICKUP" | "DELIVERY";
    deliveryAddress?: string;
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    comment?: string;
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
      deliveryLatitude: orderType === "DELIVERY" ? deliveryLatitude ?? null : null,
      deliveryLongitude: orderType === "DELIVERY" ? deliveryLongitude ?? null : null,
      comment: comment?.trim() || null,
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

    await bot.telegram.sendMessage(
      staffChatId,
      buildOrderMessageText(order, branch, who),
      buildOrderKeyboard(order.id, order.status, order.type)
    );
  }

  res.json({ status: "ok", orderId: order.id, total });
});
