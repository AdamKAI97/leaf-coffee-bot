import { Language } from "@prisma/client";

export const texts: Record<Language, Record<string, string>> = {
  RU: {
    chooseLanguage: "Выберите язык:",
    welcome: "Добро пожаловать в Leaf Coffee! ☕",
    chooseBranch: "Выберите филиал:",
    branchSelected: "Вы выбрали филиал: {branch}",
    openMenu: "🛍 Открыть меню",
    menuComingSoon: "Что хотите сделать?",
    callWaiter: "🔔 Позвать официанта",
    askTableNumber: "Введите номер столика:",
    tableCallConfirmed: "Официант уже идёт к вам (столик {table}) ☕",
    tableCallAcknowledged: "✅ Официант принял ваш вызов и уже идёт к столику {table}",
    orderStatus_ACCEPTED: "✅ Ваш заказ #{id} принят",
    orderStatus_PREPARING: "👨‍🍳 Ваш заказ #{id} готовится",
    orderStatus_READY_PICKUP: "☕ Ваш заказ #{id} готов, можно забирать!",
    orderStatus_READY_DELIVERY: "☕ Ваш заказ #{id} готов, скоро выедет курьер",
    orderStatus_SENT: "🚚 Ваш заказ #{id} в пути!",
    orderCancelled: "❌ Ваш заказ #{id} отменён. Если это неожиданно — свяжитесь с кофейней.",
  },
  UZ: {
    chooseLanguage: "Tilni tanlang:",
    welcome: "Leaf Coffee-ga xush kelibsiz! ☕",
    chooseBranch: "Filialni tanlang:",
    branchSelected: "Siz filialni tanladingiz: {branch}",
    openMenu: "🛍 Menyuni ochish",
    menuComingSoon: "Nima qilmoqchisiz?",
    callWaiter: "🔔 Ofitsiantni chaqirish",
    askTableNumber: "Stol raqamini kiriting:",
    tableCallConfirmed: "Ofitsiant sizga kelmoqda (stol {table}) ☕",
    tableCallAcknowledged: "✅ Ofitsiant chaqiruvingizni qabul qildi va stol {table} tomon kelmoqda",
    orderStatus_ACCEPTED: "✅ #{id}-buyurtmangiz qabul qilindi",
    orderStatus_PREPARING: "👨‍🍳 #{id}-buyurtmangiz tayyorlanmoqda",
    orderStatus_READY_PICKUP: "☕ #{id}-buyurtmangiz tayyor, olib ketishingiz mumkin!",
    orderStatus_READY_DELIVERY: "☕ #{id}-buyurtmangiz tayyor, tez orada kuryer yo'lga chiqadi",
    orderStatus_SENT: "🚚 #{id}-buyurtmangiz yo'lda!",
    orderCancelled: "❌ #{id}-buyurtmangiz bekor qilindi. Agar bu kutilmagan bo'lsa — kofeynaga murojaat qiling.",
  },
  EN: {
    chooseLanguage: "Choose your language:",
    welcome: "Welcome to Leaf Coffee! ☕",
    chooseBranch: "Choose a branch:",
    branchSelected: "You selected branch: {branch}",
    openMenu: "🛍 Open menu",
    menuComingSoon: "What would you like to do?",
    callWaiter: "🔔 Call a waiter",
    askTableNumber: "Enter your table number:",
    tableCallConfirmed: "A waiter is on the way to table {table} ☕",
    tableCallAcknowledged: "✅ A waiter has acknowledged your call and is on the way to table {table}",
    orderStatus_ACCEPTED: "✅ Your order #{id} has been accepted",
    orderStatus_PREPARING: "👨‍🍳 Your order #{id} is being prepared",
    orderStatus_READY_PICKUP: "☕ Your order #{id} is ready for pickup!",
    orderStatus_READY_DELIVERY: "☕ Your order #{id} is ready, a courier will pick it up shortly",
    orderStatus_SENT: "🚚 Your order #{id} is on its way!",
    orderCancelled: "❌ Your order #{id} was cancelled. If unexpected, please contact the coffee shop.",
  },
};

export function t(lang: Language, key: string, vars?: Record<string, string>): string {
  let str = texts[lang][key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}
