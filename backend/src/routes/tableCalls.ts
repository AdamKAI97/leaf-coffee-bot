import { Router } from "express";
import { Markup } from "telegraf";
import { prisma } from "../prisma";

export const tableCallsRouter = Router();

// NOTE: telegramId here comes straight from the Mini App's Telegram.WebApp.initDataUnsafe,
// which the client can forge. Fine for this stage; before accepting real payments this
// needs server-side verification of Telegram's initData signature (HMAC with the bot token).
tableCallsRouter.post("/", async (req, res) => {
  const { branchId, tableNumber, telegramId, telegramUsername, telegramFirstName } = req.body;

  if (!branchId || !tableNumber || !telegramId) {
    return res.status(400).json({ error: "branchId, tableNumber and telegramId are required" });
  }

  const branch = await prisma.branch.findUnique({ where: { id: Number(branchId) } });
  if (!branch) return res.status(404).json({ error: "branch not found" });

  const customer = await prisma.customer.upsert({
    where: { telegramId: BigInt(telegramId) },
    update: {},
    create: { telegramId: BigInt(telegramId) },
  });

  const tableCall = await prisma.tableCall.create({
    data: { branchId: branch.id, customerId: customer.id, tableNumber: String(tableNumber).slice(0, 20) },
  });

  const staffChatId = process.env.TELEGRAM_ORDERS_CHAT_ID;
  if (staffChatId && process.env.TELEGRAM_BOT_TOKEN) {
    const { bot } = await import("../bot");
    const who = telegramUsername ? `@${telegramUsername}` : telegramFirstName || "Гость";
    await bot.telegram.sendMessage(
      staffChatId,
      `🔔 Вызов официанта (из Mini App)\nФилиал: ${branch.nameRu}\nСтолик: ${tableCall.tableNumber}\nГость: ${who}`,
      Markup.inlineKeyboard([Markup.button.callback("✅ Принять", `tableack:${tableCall.id}`)])
    );
  }

  res.json({ status: "ok", tableCallId: tableCall.id });
});
