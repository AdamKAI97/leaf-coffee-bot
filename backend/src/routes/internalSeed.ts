import { Router } from "express";
import { prisma } from "../prisma";

export const internalSeedRouter = Router();

const variantGroups = [
  {
    key: "SIZE" as const,
    nameRu: "Размер",
    nameUz: "O'lcham",
    nameEn: "Size",
    options: [
      { nameRu: "S", nameUz: "S", nameEn: "S", priceDelta: 0, sortOrder: 1 },
      { nameRu: "M", nameUz: "M", nameEn: "M", priceDelta: 5000, sortOrder: 2 },
      { nameRu: "L", nameUz: "L", nameEn: "L", priceDelta: 9000, sortOrder: 3 },
    ],
  },
  {
    key: "TEMPERATURE" as const,
    nameRu: "Температура",
    nameUz: "Harorat",
    nameEn: "Temperature",
    options: [
      { nameRu: "Горячий", nameUz: "Issiq", nameEn: "Hot", priceDelta: 0, sortOrder: 1 },
      { nameRu: "Ледяной", nameUz: "Muzli", nameEn: "Iced", priceDelta: 0, sortOrder: 2 },
    ],
  },
  {
    key: "DECAF" as const,
    nameRu: "Декаф",
    nameUz: "Dekaf",
    nameEn: "Decaf",
    options: [
      { nameRu: "Обычный", nameUz: "Oddiy", nameEn: "Regular", priceDelta: 0, sortOrder: 1 },
      { nameRu: "Без кофеина", nameUz: "Kofeinsiz", nameEn: "Decaf", priceDelta: 3000, sortOrder: 2 },
    ],
  },
  {
    key: "SUGAR" as const,
    nameRu: "Уровень сахара",
    nameUz: "Shakar darajasi",
    nameEn: "Sugar level",
    options: [
      { nameRu: "Мало", nameUz: "Kam", nameEn: "Low", priceDelta: 0, sortOrder: 1 },
      { nameRu: "Средний", nameUz: "O'rta", nameEn: "Medium", priceDelta: 0, sortOrder: 2 },
      { nameRu: "Высокий", nameUz: "Yuqori", nameEn: "High", priceDelta: 0, sortOrder: 3 },
    ],
  },
];

const branches = [
  {
    nameRu: "Leaf Coffee — ЧПК",
    nameUz: "Leaf Coffee — ChPK",
    nameEn: "Leaf Coffee — ChPK",
    addressRu: "Ферганская область, Коканд, улица Шохрухобод (автобусная остановка)",
    addressUz: "Farg'ona viloyati, Qo'qon, Shohruhobod ko'chasi (avtobus bekati)",
    addressEn: "Fergana region, Kokand, Shokhrukhobod street (bus stop)",
    opensAt: "00:00",
    closesAt: "23:59",
  },
  {
    nameRu: "Leaf Coffee — 18 мактаб",
    nameUz: "Leaf Coffee — 18-maktab",
    nameEn: "Leaf Coffee — School 18",
    addressRu: "Ферганская область, Коканд, улица Убая Орипова, 20",
    addressUz: "Farg'ona viloyati, Qo'qon, Ubay Oripov ko'chasi, 20",
    addressEn: "Fergana region, Kokand, Ubay Oripov street, 20",
    opensAt: "00:00",
    closesAt: "23:59",
  },
  {
    nameRu: "Leaf Coffee — Город",
    nameUz: "Leaf Coffee — Shahar",
    nameEn: "Leaf Coffee — Downtown",
    addressRu: "Ферганская область, Коканд, улица Турон, 7",
    addressUz: "Farg'ona viloyati, Qo'qon, Turon ko'chasi, 7",
    addressEn: "Fergana region, Kokand, Turon street, 7",
    opensAt: "00:00",
    closesAt: "23:59",
  },
];

const categories = [
  { key: "coffee", ru: "Кофе", uz: "Qahva", en: "Coffee", sortOrder: 1, icon: "cupHot" },
  { key: "cold", ru: "Холодные напитки", uz: "Sovuq ichimliklar", en: "Cold drinks", sortOrder: 2, icon: "cupCold" },
  { key: "tea", ru: "Чай", uz: "Choy", en: "Tea", sortOrder: 3, icon: "cupHot" },
  { key: "dessert", ru: "Десерты", uz: "Desertlar", en: "Desserts", sortOrder: 4, icon: "cake" },
];

const items = [
  { cat: "coffee", ru: "Капучино", uz: "Kapuchino", en: "Cappuccino", price: 25000, variants: ["SIZE", "TEMPERATURE", "DECAF", "SUGAR"] },
  { cat: "coffee", ru: "Латте", uz: "Latte", en: "Latte", price: 27000, variants: ["SIZE", "TEMPERATURE", "DECAF", "SUGAR"] },
  { cat: "coffee", ru: "Американо", uz: "Amerikano", en: "Americano", price: 20000, variants: ["SIZE", "TEMPERATURE", "DECAF", "SUGAR"] },
  { cat: "coffee", ru: "Раф", uz: "Raf", en: "Raf", price: 32000, variants: ["SIZE", "TEMPERATURE", "DECAF", "SUGAR"] },
  { cat: "coffee", ru: "Флэт Уайт", uz: "Flet Vayt", en: "Flat White", price: 28000, variants: ["SIZE", "TEMPERATURE", "DECAF", "SUGAR"] },
  { cat: "coffee", ru: "Эспрессо", uz: "Espresso", en: "Espresso", price: 16000, variants: ["SIZE", "DECAF"] },
  { cat: "cold", ru: "Айс Латте", uz: "Ays Latte", en: "Iced Latte", price: 29000, variants: ["SIZE", "DECAF", "SUGAR"] },
  { cat: "cold", ru: "Лимонад Leaf", uz: "Leaf Limonadi", en: "Leaf Lemonade", price: 24000, variants: ["SIZE", "SUGAR"] },
  { cat: "tea", ru: "Чёрный чай", uz: "Qora choy", en: "Black Tea", price: 15000, variants: ["SIZE", "TEMPERATURE", "SUGAR"] },
  { cat: "tea", ru: "Зелёный чай", uz: "Yashil choy", en: "Green Tea", price: 15000, variants: ["SIZE", "TEMPERATURE", "SUGAR"] },
  { cat: "dessert", ru: "Круассан", uz: "Kruassan", en: "Croissant", price: 18000, variants: [] },
  { cat: "dessert", ru: "Чизкейк", uz: "Chizkeyk", en: "Cheesecake", price: 32000, variants: [] },
];

async function runSeed(req: any, res: any) {
  if (req.query.key !== process.env.SEED_SECRET) {
    return res.status(403).json({ error: "forbidden" });
  }

  for (const branch of branches) {
    const existing = await prisma.branch.findFirst({
      where: { addressRu: branch.addressRu },
    });
    if (existing) {
      await prisma.branch.update({ where: { id: existing.id }, data: branch });
    } else {
      await prisma.branch.create({ data: branch });
    }
  }

  const variantGroupIds: Record<string, number> = {};

  for (const group of variantGroups) {
    const created = await prisma.variantGroup.upsert({
      where: { key: group.key },
      update: { nameRu: group.nameRu, nameUz: group.nameUz, nameEn: group.nameEn },
      create: {
        key: group.key,
        nameRu: group.nameRu,
        nameUz: group.nameUz,
        nameEn: group.nameEn,
      },
    });
    variantGroupIds[group.key] = created.id;

    for (const option of group.options) {
      const existing = await prisma.variantOption.findFirst({
        where: { variantGroupId: created.id, nameEn: option.nameEn },
      });
      if (existing) {
        await prisma.variantOption.update({ where: { id: existing.id }, data: option });
      } else {
        await prisma.variantOption.create({ data: { ...option, variantGroupId: created.id } });
      }
    }
  }

  const categoryIds: Record<string, number> = {};
  for (const cat of categories) {
    const existing = await prisma.menuCategory.findFirst({ where: { nameEn: cat.en } });
    const record = existing
      ? await prisma.menuCategory.update({
          where: { id: existing.id },
          data: { nameRu: cat.ru, nameUz: cat.uz, nameEn: cat.en, sortOrder: cat.sortOrder, icon: cat.icon },
        })
      : await prisma.menuCategory.create({
          data: { nameRu: cat.ru, nameUz: cat.uz, nameEn: cat.en, sortOrder: cat.sortOrder, icon: cat.icon },
        });
    categoryIds[cat.key] = record.id;
  }

  for (const item of items) {
    const existing = await prisma.menuItem.findFirst({
      where: { nameEn: item.en, categoryId: categoryIds[item.cat] },
    });
    const menuItem = existing
      ? await prisma.menuItem.update({
          where: { id: existing.id },
          data: { nameRu: item.ru, nameUz: item.uz, nameEn: item.en, basePrice: item.price },
        })
      : await prisma.menuItem.create({
          data: {
            categoryId: categoryIds[item.cat],
            nameRu: item.ru,
            nameUz: item.uz,
            nameEn: item.en,
            basePrice: item.price,
          },
        });

    for (const variantKey of item.variants) {
      const groupId = variantGroupIds[variantKey];
      const existingLink = await prisma.menuItemVariantGroup.findUnique({
        where: { menuItemId_variantGroupId: { menuItemId: menuItem.id, variantGroupId: groupId } },
      });
      if (!existingLink) {
        await prisma.menuItemVariantGroup.create({
          data: { menuItemId: menuItem.id, variantGroupId: groupId },
        });
      }
    }
  }

  res.json({ status: "seeded" });
}

internalSeedRouter.post("/", runSeed);
internalSeedRouter.get("/", runSeed);
