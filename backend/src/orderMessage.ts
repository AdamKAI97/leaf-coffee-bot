import { Markup } from "telegraf";
import { OrderStatus, OrderType } from "@prisma/client";

export type OrderForMessage = {
  id: number;
  type: OrderType;
  status: OrderStatus;
  totalPrice: number;
  deliveryAddress: string | null;
  deliveryLatitude: number | null;
  deliveryLongitude: number | null;
  comment: string | null;
  items: {
    quantity: number;
    unitPrice: number;
    menuItem: { nameRu: string };
    variants: { variantOption: { nameRu: string } }[];
  }[];
};

const STATUS_ORDER: OrderStatus[] = ["CREATED", "ACCEPTED", "PREPARING", "READY", "SENT"];

export function nextOrderStatus(current: OrderStatus, type: OrderType): OrderStatus | null {
  if (current === "CREATED") return "ACCEPTED";
  if (current === "ACCEPTED") return "PREPARING";
  if (current === "PREPARING") return "READY";
  if (current === "READY") return type === "DELIVERY" ? "SENT" : null;
  return null;
}

export function isFinalStatus(status: OrderStatus, type: OrderType): boolean {
  return status === "CANCELLED" || (status === "READY" && type === "PICKUP") || status === "SENT";
}

const TRANSITION_BUTTON_LABEL: Partial<Record<OrderStatus, string>> = {
  ACCEPTED: "✅ Принять",
  PREPARING: "👨‍🍳 Готовлю",
  READY: "✅ Готово",
  SENT: "🚚 Отправлен",
};

export function statusLineRu(status: OrderStatus, type: OrderType): string {
  switch (status) {
    case "CREATED":
      return "Оформлен";
    case "ACCEPTED":
      return "Принят";
    case "PREPARING":
      return "Готовится";
    case "READY":
      return type === "DELIVERY" ? "Готов, ожидает отправки" : "Готов к выдаче";
    case "SENT":
      return "Отправлен";
    case "CANCELLED":
      return "Отменён";
    default:
      return status;
  }
}

export function buildOrderKeyboard(orderId: number, current: OrderStatus, type: OrderType) {
  if (isFinalStatus(current, type)) return undefined;
  const next = nextOrderStatus(current, type);
  if (!next) return undefined;
  const label = TRANSITION_BUTTON_LABEL[next] ?? `→ ${next}`;
  return Markup.inlineKeyboard([
    [Markup.button.callback(label, `orderstatus:${orderId}:${next}`)],
    [Markup.button.callback("❌ Отменить", `ordercancel:${orderId}`)],
  ]);
}

export function buildOrderMessageText(
  order: OrderForMessage,
  branch: { nameRu: string },
  who: string
): string {
  const lines = order.items
    .map((oi) => {
      const variants = oi.variants.map((v) => v.variantOption.nameRu).join(", ");
      return `• ${oi.menuItem.nameRu}${variants ? ` (${variants})` : ""} x${oi.quantity} — ${oi.unitPrice * oi.quantity} сум`;
    })
    .join("\n");

  const mapLink =
    order.deliveryLatitude && order.deliveryLongitude
      ? `\nКарта: https://maps.google.com/?q=${order.deliveryLatitude},${order.deliveryLongitude}`
      : "";
  const typeText =
    order.type === "PICKUP" ? "Самовывоз" : `Доставка: ${order.deliveryAddress}${mapLink}`;
  const commentText = order.comment ? `\nКомментарий: ${order.comment}` : "";

  return (
    `🧾 Заказ #${order.id}\nФилиал: ${branch.nameRu}\n${typeText}\nГость: ${who}${commentText}\n\n` +
    `${lines}\n\nИтого: ${order.totalPrice} сум\nОплата: наличными при получении\n\n` +
    `Статус: ${statusLineRu(order.status, order.type)}`
  );
}
