import { Language } from "@prisma/client";

export const texts: Record<Language, Record<string, string>> = {
  RU: {
    chooseLanguage: "Выберите язык:",
    welcome: "Добро пожаловать в Leaf Coffee! ☕",
    chooseBranch: "Выберите филиал:",
    branchSelected: "Вы выбрали филиал: {branch}",
    openMenu: "🛍 Открыть меню",
    menuComingSoon: "Меню скоро будет доступно здесь.",
    callWaiter: "🔔 Позвать официанта",
    askTableNumber: "Введите номер столика:",
    tableCallConfirmed: "Официант уже идёт к вам (столик {table}) ☕",
  },
  UZ: {
    chooseLanguage: "Tilni tanlang:",
    welcome: "Leaf Coffee-ga xush kelibsiz! ☕",
    chooseBranch: "Filialni tanlang:",
    branchSelected: "Siz filialni tanladingiz: {branch}",
    openMenu: "🛍 Menyuni ochish",
    menuComingSoon: "Menyu tez orada shu yerda bo'ladi.",
    callWaiter: "🔔 Ofitsiantni chaqirish",
    askTableNumber: "Stol raqamini kiriting:",
    tableCallConfirmed: "Ofitsiant sizga kelmoqda (stol {table}) ☕",
  },
  EN: {
    chooseLanguage: "Choose your language:",
    welcome: "Welcome to Leaf Coffee! ☕",
    chooseBranch: "Choose a branch:",
    branchSelected: "You selected branch: {branch}",
    openMenu: "🛍 Open menu",
    menuComingSoon: "The menu will be available here soon.",
    callWaiter: "🔔 Call a waiter",
    askTableNumber: "Enter your table number:",
    tableCallConfirmed: "A waiter is on the way to table {table} ☕",
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
