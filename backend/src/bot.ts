import { Telegraf, Markup } from "telegraf";
import { Language, OrderStatus } from "@prisma/client";
import { prisma } from "./prisma";
import { t } from "./i18n/texts";
import { buildOrderMessageText, buildOrderKeyboard, nextOrderStatus, statusLineRu } from "./orderMessage";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set");
}

export const bot = new Telegraf(token);

// In-memory only: which branch a customer last picked, and whether we're
// waiting on them to type a table number after tapping the bell button.
const selectedBranch = new Map<number, number>();
const pendingTableCall = new Map<number, number>();

function branchName(branch: { nameRu: string; nameUz: string; nameEn: string }, lang: Language) {
  if (lang === "RU") return branch.nameRu;
  if (lang === "UZ") return branch.nameUz;
  return branch.nameEn;
}

async function getOrCreateCustomer(telegramId: number) {
  return prisma.customer.upsert({
    where: { telegramId: BigInt(telegramId) },
    update: {},
    create: { telegramId: BigInt(telegramId) },
  });
}

async function showBranchSelection(ctx: any, lang: Language) {
  const branches = await prisma.branch.findMany({ where: { isActive: true } });
  const buttons = branches.map((b) =>
    Markup.button.callback(branchName(b, lang), `branch:${b.id}`)
  );
  await ctx.reply(t(lang, "chooseBranch"), Markup.inlineKeyboard(buttons, { columns: 1 }));
}

bot.start(async (ctx) => {
  await getOrCreateCustomer(ctx.from.id);
  await ctx.reply(
    t("RU", "chooseLanguage"),
    Markup.inlineKeyboard([
      Markup.button.callback("Русский", "lang:RU"),
      Markup.button.callback("O'zbekcha", "lang:UZ"),
      Markup.button.callback("English", "lang:EN"),
    ])
  );
});

bot.action(/^lang:(RU|UZ|EN)$/, async (ctx) => {
  const lang = ctx.match[1] as Language;
  await prisma.customer.update({
    where: { telegramId: BigInt(ctx.from.id) },
    data: { language: lang },
  });
  await ctx.answerCbQuery();
  await ctx.reply(t(lang, "welcome"));
  await showBranchSelection(ctx, lang);
});

bot.action(/^branch:(\d+)$/, async (ctx) => {
  const branchId = Number(ctx.match[1]);
  const customer = await prisma.customer.findUnique({
    where: { telegramId: BigInt(ctx.from.id) },
  });
  const lang = customer?.language ?? "RU";
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) return ctx.answerCbQuery();

  selectedBranch.set(ctx.from.id, branchId);

  await ctx.answerCbQuery();
  await ctx.reply(t(lang, "branchSelected", { branch: branchName(branch, lang) }));

  const miniAppUrl = process.env.MINIAPP_URL;
  const buttons = [
    ...(miniAppUrl
      ? [Markup.button.webApp(t(lang, "openMenu"), `${miniAppUrl}?branch=${branchId}`)]
      : []),
    Markup.button.callback(t(lang, "callWaiter"), `bell:${branchId}`),
  ];
  await ctx.reply(t(lang, "menuComingSoon"), Markup.inlineKeyboard(buttons, { columns: 1 }));
});

bot.action(/^bell:(\d+)$/, async (ctx) => {
  const branchId = Number(ctx.match[1]);
  const customer = await prisma.customer.findUnique({
    where: { telegramId: BigInt(ctx.from.id) },
  });
  const lang = customer?.language ?? "RU";

  pendingTableCall.set(ctx.from.id, branchId);
  await ctx.answerCbQuery();
  await ctx.reply(t(lang, "askTableNumber"));
});

bot.command("chatid", async (ctx) => {
  await ctx.reply(`Chat ID: ${ctx.chat.id}`);
});

bot.on("text", async (ctx, next) => {
  const branchId = pendingTableCall.get(ctx.from.id);
  if (branchId === undefined) return next();
  pendingTableCall.delete(ctx.from.id);

  const tableNumber = ctx.message.text.trim().slice(0, 20);
  const customer = await getOrCreateCustomer(ctx.from.id);
  const lang = customer.language;
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch || !tableNumber) return;

  const tableCall = await prisma.tableCall.create({
    data: { branchId, customerId: customer.id, tableNumber },
  });

  await ctx.reply(t(lang, "tableCallConfirmed", { table: tableNumber }));

  const staffChatId = process.env.TELEGRAM_ORDERS_CHAT_ID;
  if (staffChatId) {
    const who = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
    await bot.telegram.sendMessage(
      staffChatId,
      `🔔 Вызов официанта\nФилиал: ${branch.nameRu}\nСтолик: ${tableNumber}\nГость: ${who}`,
      Markup.inlineKeyboard([Markup.button.callback("✅ Принять", `tableack:${tableCall.id}`)])
    );
  } else {
    console.warn("TELEGRAM_ORDERS_CHAT_ID not set, table call not forwarded to staff");
  }
});

bot.action(/^tableack:(\d+)$/, async (ctx) => {
  const tableCallId = Number(ctx.match[1]);
  const tableCall = await prisma.tableCall.findUnique({
    where: { id: tableCallId },
    include: { customer: true },
  });

  if (!tableCall) return ctx.answerCbQuery();
  if (tableCall.status === "ACKNOWLEDGED") {
    return ctx.answerCbQuery("Уже принято", { show_alert: false });
  }

  await prisma.tableCall.update({
    where: { id: tableCallId },
    data: { status: "ACKNOWLEDGED" },
  });

  const staffName = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
  await ctx.answerCbQuery("Принято");
  await ctx.editMessageText(
    `${(ctx.callbackQuery.message as any).text}\n\n✅ Принято: ${staffName}`
  );

  await bot.telegram.sendMessage(
    tableCall.customer.telegramId.toString(),
    t(tableCall.customer.language, "tableCallAcknowledged", { table: tableCall.tableNumber })
  );
});

async function loadOrderForMessage(orderId: number) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      branch: true,
      items: { include: { menuItem: true, variants: { include: { variantOption: true } } } },
    },
  });
}

bot.action(/^orderstatus:(\d+):(\w+)$/, async (ctx) => {
  const orderId = Number(ctx.match[1]);
  const targetStatus = ctx.match[2] as OrderStatus;
  const order = await loadOrderForMessage(orderId);
  if (!order) return ctx.answerCbQuery();

  const expectedNext = nextOrderStatus(order.status, order.type);
  if (order.status === "CANCELLED" || expectedNext !== targetStatus) {
    return ctx.answerCbQuery("Уже обновлено", { show_alert: false });
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: targetStatus } });
  await prisma.orderStatusLog.create({ data: { orderId, status: targetStatus } });
  order.status = targetStatus;

  const staffName = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
  await ctx.answerCbQuery(statusLineRu(targetStatus, order.type));
  await ctx.editMessageText(
    `${buildOrderMessageText(order, order.branch, staffName)}\n(обновил: ${staffName})`,
    buildOrderKeyboard(order.id, order.status, order.type)
  );

  const statusKey =
    targetStatus === "READY"
      ? `orderStatus_READY_${order.type}`
      : `orderStatus_${targetStatus}`;
  await bot.telegram.sendMessage(
    order.customer.telegramId.toString(),
    t(order.customer.language, statusKey, { id: String(order.id) })
  );
});

bot.action(/^ordercancel:(\d+)$/, async (ctx) => {
  const orderId = Number(ctx.match[1]);
  const order = await loadOrderForMessage(orderId);
  if (!order) return ctx.answerCbQuery();
  if (order.status === "CANCELLED" || order.status === "SENT" || (order.status === "READY" && order.type === "PICKUP")) {
    return ctx.answerCbQuery("Нельзя отменить", { show_alert: false });
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
  await prisma.orderStatusLog.create({ data: { orderId, status: "CANCELLED" } });
  order.status = "CANCELLED";

  const staffName = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
  await ctx.answerCbQuery("Отменено");
  await ctx.editMessageText(`${buildOrderMessageText(order, order.branch, staffName)}\n(отменил: ${staffName})`);

  await bot.telegram.sendMessage(
    order.customer.telegramId.toString(),
    t(order.customer.language, "orderCancelled", { id: String(order.id) })
  );
});
