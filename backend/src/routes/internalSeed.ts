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
  { key: "bakery", ru: "Выпечка и сэндвичи", uz: "Non mahsulotlari va sendvichlar", en: "Bakery & sandwiches", sortOrder: 5, icon: "pastry" },
];

const items = [
  // Кофе
  { cat: "coffee", ru: "Эспрессо", uz: "Espresso", en: "Espresso", price: 16000, variants: ["SIZE", "DECAF"],
    descRu: "Насыщенный концентрированный кофе на одну порцию.", descUz: "Bir porsiyalik quyuq va konsentrlangan qahva.", descEn: "A concentrated single shot of coffee." },
  { cat: "coffee", ru: "Американо", uz: "Amerikano", en: "Americano", price: 20000, variants: ["SIZE", "TEMPERATURE", "DECAF", "SUGAR"],
    descRu: "Эспрессо, разбавленный горячей водой.", descUz: "Issiq suv bilan suyultirilgan espresso.", descEn: "Espresso diluted with hot water." },
  { cat: "coffee", ru: "Капучино", uz: "Kapuchino", en: "Cappuccino", price: 25000, variants: ["SIZE", "TEMPERATURE", "DECAF", "SUGAR"],
    descRu: "Эспрессо с молоком и плотной молочной пенкой.", descUz: "Sut va zich sut ko'pigi bilan espresso.", descEn: "Espresso with milk and a thick layer of foam." },
  { cat: "coffee", ru: "Латте", uz: "Latte", en: "Latte", price: 27000, variants: ["SIZE", "TEMPERATURE", "DECAF", "SUGAR"],
    descRu: "Мягкий кофе с большим количеством молока.", descUz: "Ko'p sut bilan yumshoq qahva.", descEn: "A mild coffee with plenty of steamed milk." },
  { cat: "coffee", ru: "Флэт Уайт", uz: "Flet Vayt", en: "Flat White", price: 28000, variants: ["SIZE", "TEMPERATURE", "DECAF", "SUGAR"],
    descRu: "Двойной эспрессо с бархатистой молочной микропенкой.", descUz: "Ikkilangan espresso va baxmal sut ko'pigi.", descEn: "Double espresso with velvety micro-foam milk." },
  { cat: "coffee", ru: "Раф", uz: "Raf", en: "Raf", price: 32000, variants: ["SIZE", "TEMPERATURE", "DECAF", "SUGAR"],
    descRu: "Кофе со сливками и ванильным сахаром, взбитый до пенки.", descUz: "Qaymoq va vanilli shakar bilan ko'pirtirilgan qahva.", descEn: "Coffee whipped with cream and vanilla sugar." },
  { cat: "coffee", ru: "Мокка", uz: "Mokka", en: "Mocha", price: 30000, variants: ["SIZE", "TEMPERATURE", "DECAF", "SUGAR"],
    descRu: "Кофе с шоколадом и молоком.", descUz: "Shokolad va sut bilan qahva.", descEn: "Coffee with chocolate and milk." },
  { cat: "coffee", ru: "Карамельный латте", uz: "Karamelli latte", en: "Caramel Latte", price: 29000, variants: ["SIZE", "TEMPERATURE", "DECAF", "SUGAR"],
    descRu: "Латте с карамельным сиропом.", descUz: "Karamel siropli latte.", descEn: "Latte with caramel syrup." },
  { cat: "coffee", ru: "Ванильный капучино", uz: "Vanilli kapuchino", en: "Vanilla Cappuccino", price: 27000, variants: ["SIZE", "TEMPERATURE", "DECAF", "SUGAR"],
    descRu: "Капучино с ванильным сиропом.", descUz: "Vanil siropli kapuchino.", descEn: "Cappuccino with vanilla syrup." },
  { cat: "coffee", ru: "Кофе по-турецки", uz: "Turk qahvasi", en: "Turkish Coffee", price: 22000, variants: ["DECAF", "SUGAR"],
    descRu: "Кофе, сваренный в турке, подаётся с гущей.", descUz: "Jazvada qaynatilgan, cho'kindisi bilan tortiladi.", descEn: "Coffee brewed in a cezve, served unfiltered." },

  // Холодные напитки
  { cat: "cold", ru: "Айс Латте", uz: "Ays Latte", en: "Iced Latte", price: 29000, variants: ["SIZE", "DECAF", "SUGAR"],
    descRu: "Латте со льдом.", descUz: "Muzli latte.", descEn: "Latte served over ice." },
  { cat: "cold", ru: "Айс Американо", uz: "Ays Amerikano", en: "Iced Americano", price: 22000, variants: ["SIZE", "DECAF", "SUGAR"],
    descRu: "Американо со льдом.", descUz: "Muzli amerikano.", descEn: "Americano served over ice." },
  { cat: "cold", ru: "Фраппе", uz: "Frappe", en: "Frappe", price: 30000, variants: ["SIZE", "DECAF", "SUGAR"],
    descRu: "Взбитый холодный кофе с пенкой.", descUz: "Ko'pikli sovuq qahva.", descEn: "Whipped iced coffee with foam." },
  { cat: "cold", ru: "Лимонад Leaf", uz: "Leaf Limonadi", en: "Leaf Lemonade", price: 24000, variants: ["SIZE", "SUGAR"],
    descRu: "Цитрусовый лимонад с мятой.", descUz: "Yalpiz bilan sitrus limonadi.", descEn: "Citrus lemonade with mint." },
  { cat: "cold", ru: "Ягодный лимонад", uz: "Rezavorli limonad", en: "Berry Lemonade", price: 26000, variants: ["SIZE", "SUGAR"],
    descRu: "Лимонад на основе сезонных ягод.", descUz: "Mavsumiy rezavorlardan tayyorlangan limonad.", descEn: "Lemonade made with seasonal berries." },
  { cat: "cold", ru: "Холодный чай с персиком", uz: "Muzli choy (shaftoli)", en: "Iced Tea (Peach)", price: 22000, variants: ["SIZE", "SUGAR"],
    descRu: "Освежающий чай со льдом и вкусом персика.", descUz: "Shaftoli ta'mli, muzli va yayratuvchi choy.", descEn: "Refreshing iced tea with peach flavor." },

  // Чай
  { cat: "tea", ru: "Чёрный чай", uz: "Qora choy", en: "Black Tea", price: 15000, variants: ["SIZE", "TEMPERATURE", "SUGAR"],
    descRu: "Классический чёрный чай.", descUz: "Klassik qora choy.", descEn: "Classic black tea." },
  { cat: "tea", ru: "Зелёный чай", uz: "Yashil choy", en: "Green Tea", price: 15000, variants: ["SIZE", "TEMPERATURE", "SUGAR"],
    descRu: "Классический зелёный чай.", descUz: "Klassik yashil choy.", descEn: "Classic green tea." },
  { cat: "tea", ru: "Чай с мятой", uz: "Yalpiz choy", en: "Mint Tea", price: 17000, variants: ["SIZE", "TEMPERATURE", "SUGAR"],
    descRu: "Чёрный чай со свежей мятой.", descUz: "Yangi yalpiz bilan qora choy.", descEn: "Black tea with fresh mint." },
  { cat: "tea", ru: "Чай каркаде", uz: "Karkade choy", en: "Hibiscus Tea", price: 17000, variants: ["SIZE", "TEMPERATURE", "SUGAR"],
    descRu: "Кисловатый чай насыщенного красного цвета.", descUz: "Nordon ta'mli, to'q qizil rangli choy.", descEn: "Tart, deep-red hibiscus tea." },
  { cat: "tea", ru: "Имбирный чай с лимоном", uz: "Zanjabil-limon choy", en: "Ginger Lemon Tea", price: 18000, variants: ["SIZE", "TEMPERATURE", "SUGAR"],
    descRu: "Согревающий чай с имбирём и лимоном.", descUz: "Zanjabil va limon bilan isituvchi choy.", descEn: "Warming tea with ginger and lemon." },

  // Десерты
  { cat: "dessert", ru: "Чизкейк Нью-Йорк", uz: "Nyu-York chizkeyki", en: "New York Cheesecake", price: 32000, variants: [],
    descRu: "Классический сливочный чизкейк.", descUz: "Klassik kremli chizkeyk.", descEn: "Classic creamy New York-style cheesecake." },
  { cat: "dessert", ru: "Тирамису", uz: "Tiramisu", en: "Tiramisu", price: 30000, variants: [],
    descRu: "Итальянский десерт с маскарпоне и кофе.", descUz: "Maskarpone va qahva bilan italyan deserti.", descEn: "Italian dessert with mascarpone and coffee." },
  { cat: "dessert", ru: "Морковный торт", uz: "Sabzili keks", en: "Carrot Cake", price: 28000, variants: [],
    descRu: "Влажный бисквит с морковью и кремом.", descUz: "Sabzi va krem bilan nam biskvit.", descEn: "Moist carrot sponge cake with cream frosting." },
  { cat: "dessert", ru: "Брауни", uz: "Brauni", en: "Brownie", price: 24000, variants: [],
    descRu: "Плотный шоколадный бисквит.", descUz: "Zich shokoladli biskvit.", descEn: "Dense chocolate brownie." },
  { cat: "dessert", ru: "Синнабон", uz: "Sinnabon", en: "Cinnamon Roll", price: 22000, variants: [],
    descRu: "Булочка с корицей и сливочной глазурью.", descUz: "Dolchin va kremli glazur bilan bulochka.", descEn: "Cinnamon roll with cream cheese icing." },

  // Выпечка и сэндвичи
  { cat: "bakery", ru: "Круассан классический", uz: "Klassik kruassan", en: "Classic Croissant", price: 18000, variants: [],
    descRu: "Слоёный масляный круассан.", descUz: "Qatlamli sariyog'li kruassan.", descEn: "Flaky butter croissant." },
  { cat: "bakery", ru: "Шоколадный круассан", uz: "Shokoladli kruassan", en: "Chocolate Croissant", price: 20000, variants: [],
    descRu: "Круассан с шоколадной начинкой.", descUz: "Shokolad ichlikli kruassan.", descEn: "Croissant filled with chocolate." },
  { cat: "bakery", ru: "Круассан с ветчиной и сыром", uz: "Vetchina-pishloqli kruassan", en: "Ham & Cheese Croissant", price: 27000, variants: [],
    descRu: "Несладкий круассан с ветчиной и сыром.", descUz: "Vetchina va pishloq bilan shirin bo'lmagan kruassan.", descEn: "Savory croissant with ham and cheese." },
  { cat: "bakery", ru: "Сэндвич с курицей", uz: "Tovuqli sendvich", en: "Chicken Sandwich", price: 28000, variants: [],
    descRu: "Сэндвич с куриным филе и овощами.", descUz: "Tovuq filesi va sabzavotlar bilan sendvich.", descEn: "Sandwich with chicken fillet and vegetables." },
  { cat: "bakery", ru: "Сэндвич Капрезе", uz: "Kaprese sendvich", en: "Caprese Sandwich", price: 26000, variants: [],
    descRu: "Сэндвич с моцареллой, томатами и песто.", descUz: "Motsarella, pomidor va pesto bilan sendvich.", descEn: "Sandwich with mozzarella, tomato and pesto." },
  { cat: "bakery", ru: "Мини-кексы ассорти", uz: "Mini keks assorti", en: "Mini Muffin Assortment", price: 20000, variants: [],
    descRu: "Набор из трёх мини-кексов на выбор.", descUz: "Uchta mini keksdan iborat to'plam.", descEn: "A set of three assorted mini muffins." },
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
          data: {
            nameRu: item.ru,
            nameUz: item.uz,
            nameEn: item.en,
            basePrice: item.price,
            descriptionRu: item.descRu,
            descriptionUz: item.descUz,
            descriptionEn: item.descEn,
          },
        })
      : await prisma.menuItem.create({
          data: {
            categoryId: categoryIds[item.cat],
            nameRu: item.ru,
            nameUz: item.uz,
            nameEn: item.en,
            basePrice: item.price,
            descriptionRu: item.descRu,
            descriptionUz: item.descUz,
            descriptionEn: item.descEn,
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
