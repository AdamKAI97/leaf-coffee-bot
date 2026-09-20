# Leaf Coffee

Telegram-бот + Mini App для заказа кофе: выбор филиала, меню с вариантами (размер/температура/декаф/сахар), доставка или самовывоз, оплата Payme/Click/наличными, программа лояльности, мультиязычность (RU/UZ/EN).

## Структура

- `backend/` — API + Telegram-бот (Node.js, Express, Prisma)
- `miniapp/` — Telegram Mini App для оформления заказа (Next.js)
- `admin/` — админ-панель для владельца кофейни (Next.js)
- `docs/` — архитектура, инструкции по настройке, бренд-ассеты

## Документация

- [Архитектура](docs/ARCHITECTURE.md)
- [Настройка сервисов (Neon/Render/Vercel)](docs/SETUP.md)
