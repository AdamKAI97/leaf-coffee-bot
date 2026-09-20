import { Telegraf, Markup } from "telegraf";
import { Language } from "@prisma/client";
import { prisma } from "./prisma";
import { t } from "./i18n/texts";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set");
}

export const bot = new Telegraf(token);

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

bot.action(/lang:(RU|UZ|EN)/, async (ctx) => {
  const lang = ctx.match[1] as Language;
  await prisma.customer.update({
    where: { telegramId: BigInt(ctx.from.id) },
    data: { language: lang },
  });
  await ctx.answerCbQuery();
  await ctx.reply(t(lang, "welcome"));
  await showBranchSelection(ctx, lang);
});

bot.action(/branch:(\d+)/, async (ctx) => {
  const branchId = Number(ctx.match[1]);
  const customer = await prisma.customer.findUnique({
    where: { telegramId: BigInt(ctx.from.id) },
  });
  const lang = customer?.language ?? "RU";
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) return ctx.answerCbQuery();

  await ctx.answerCbQuery();
  await ctx.reply(t(lang, "branchSelected", { branch: branchName(branch, lang) }));
  await ctx.reply(t(lang, "menuComingSoon"));
});
