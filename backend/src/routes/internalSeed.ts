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

internalSeedRouter.post("/", async (req, res) => {
  if (req.query.key !== process.env.SEED_SECRET) {
    return res.status(403).json({ error: "forbidden" });
  }

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

  res.json({ status: "seeded" });
});
