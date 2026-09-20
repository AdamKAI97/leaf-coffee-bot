import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

type Lang = "ru" | "uz" | "en";

type VariantOption = {
  id: number;
  nameRu: string;
  nameUz: string;
  nameEn: string;
  priceDelta: number;
  sortOrder: number;
};

type VariantGroup = {
  id: number;
  key: "SIZE" | "TEMPERATURE" | "DECAF" | "SUGAR";
  nameRu: string;
  nameUz: string;
  nameEn: string;
  options: VariantOption[];
};

type MenuItem = {
  id: number;
  nameRu: string;
  nameUz: string;
  nameEn: string;
  descriptionRu: string | null;
  descriptionUz: string | null;
  descriptionEn: string | null;
  basePrice: number;
  imageUrl: string | null;
  variantGroups: { variantGroup: VariantGroup }[];
};

type MenuCategory = {
  id: number;
  nameRu: string;
  nameUz: string;
  nameEn: string;
  icon: string;
  sortOrder: number;
  items: MenuItem[];
};

type Branch = {
  id: number;
  nameRu: string;
  nameUz: string;
  nameEn: string;
  addressRu: string;
  addressUz: string;
  addressEn: string;
};

type CartLine = {
  id: string;
  item: MenuItem;
  variants: Record<string, number>; // groupKey -> variantOptionId
  qty: number;
  unit: number;
};

const UI: Record<Lang, Record<string, string>> = {
  ru: {
    demoBanner: "Демо-меню. Реальные позиции добавим через админ-панель.",
    pickup: "🚶 Самовывоз",
    delivery: "🚚 Доставка",
    pickupHint: "Забрать из выбранного филиала",
    deliveryHint: "Адрес доставки укажете на следующем шаге",
    checkout: "Оформить",
    addToCart: "В корзину",
    size: "Размер",
    temperature: "Температура",
    decaf: "Кофеин",
    sugar: "Сахар",
    askTableNumber: "Введите номер столика",
    tableNumberPlaceholder: "Например: 5",
    callWaiter: "Позвать официанта",
    tableCallSent: "Официант уже идёт к вам ☕",
    tableCallError: "Не получилось отправить, попробуйте ещё раз",
    chooseBranch: "Выберите филиал",
    loading: "Загрузка...",
    empty: "В этой категории пока нет позиций",
    checkoutSoon: "Оформление заказа — следующий этап разработки.",
    yourOrder: "Ваш заказ",
    remove: "✕ Удалить",
    cartEmpty: "Корзина пуста",
  },
  uz: {
    demoBanner: "Demo menyu. Haqiqiy taomlar admin panel orqali qo'shiladi.",
    pickup: "🚶 Olib ketish",
    delivery: "🚚 Yetkazib berish",
    pickupHint: "Tanlangan filialdan oling",
    deliveryHint: "Yetkazish manzilini keyingi qadamda kiritasiz",
    checkout: "Buyurtma berish",
    addToCart: "Savatga",
    size: "O'lcham",
    temperature: "Harorat",
    decaf: "Kofein",
    sugar: "Shakar",
    askTableNumber: "Stol raqamini kiriting",
    tableNumberPlaceholder: "Masalan: 5",
    callWaiter: "Ofitsiantni chaqirish",
    tableCallSent: "Ofitsiant sizga kelmoqda ☕",
    tableCallError: "Yuborilmadi, qayta urinib ko'ring",
    chooseBranch: "Filialni tanlang",
    loading: "Yuklanmoqda...",
    empty: "Bu toifada hozircha mahsulot yo'q",
    checkoutSoon: "Buyurtma rasmiylashtirish — keyingi bosqich.",
    yourOrder: "Sizning buyurtmangiz",
    remove: "✕ O'chirish",
    cartEmpty: "Savat bo'sh",
  },
  en: {
    demoBanner: "Sample menu. Real items will be added via the admin panel.",
    pickup: "🚶 Pickup",
    delivery: "🚚 Delivery",
    pickupHint: "Pick up at the selected branch",
    deliveryHint: "You'll enter a delivery address next",
    checkout: "Checkout",
    addToCart: "Add to cart",
    size: "Size",
    temperature: "Temperature",
    decaf: "Caffeine",
    sugar: "Sugar",
    askTableNumber: "Enter your table number",
    tableNumberPlaceholder: "e.g. 5",
    callWaiter: "Call a waiter",
    tableCallSent: "A waiter is on the way ☕",
    tableCallError: "Couldn't send, please try again",
    chooseBranch: "Choose a branch",
    loading: "Loading...",
    empty: "No items in this category yet",
    checkoutSoon: "Checkout — coming in the next development stage.",
    yourOrder: "Your order",
    remove: "✕ Remove",
    cartEmpty: "Cart is empty",
  },
};

const VARIANT_LABEL_KEY: Record<string, string> = {
  SIZE: "size",
  TEMPERATURE: "temperature",
  DECAF: "decaf",
  SUGAR: "sugar",
};

function localized<T extends { nameRu: string; nameUz: string; nameEn: string }>(obj: T, lang: Lang) {
  if (lang === "ru") return obj.nameRu;
  if (lang === "uz") return obj.nameUz;
  return obj.nameEn;
}

function fmt(n: number, lang: Lang) {
  const num = n.toLocaleString("ru-RU");
  if (lang === "uz") return `${num} so'm`;
  if (lang === "en") return `${num} UZS`;
  return `${num} сум`;
}

function branchShortName(branch: Branch, lang: Lang) {
  const full = localized(branch, lang);
  const dashIndex = full.indexOf("—");
  return dashIndex === -1 ? full : full.slice(dashIndex + 1).trim();
}

function itemDescription(item: MenuItem, lang: Lang) {
  if (lang === "ru") return item.descriptionRu;
  if (lang === "uz") return item.descriptionUz;
  return item.descriptionEn;
}

function cartLineVariantSummary(line: CartLine, lang: Lang) {
  return line.item.variantGroups
    .map(({ variantGroup }) => {
      const optId = line.variants[variantGroup.key];
      const opt = variantGroup.options.find((o) => o.id === optId);
      return opt ? localized(opt, lang) : null;
    })
    .filter(Boolean)
    .join(", ");
}

function IconCupHot() {
  return (
    <svg viewBox="0 0 64 64" fill="none">
      <path d="M14 24h30v16c0 8-6.5 14-15 14s-15-6-15-14V24Z" fill="var(--accent-400)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M44 28h4c3 0 5 2 5 5s-2 5-5 5h-4" stroke="var(--ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M20 16c0-3 3-3 3-6M28 16c0-3 3-3 3-6" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}
function IconCupCold() {
  return (
    <svg viewBox="0 0 64 64" fill="none">
      <path d="M18 16h28l-3 34a4 4 0 0 1-4 3.6H25a4 4 0 0 1-4-3.6L18 16Z" fill="var(--accent-400)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M16 16h32" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
      <path d="M38 12l3-6" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
function IconCake() {
  return (
    <svg viewBox="0 0 64 64" fill="none">
      <path d="M12 46 32 14l20 32Z" fill="var(--accent-400)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M18 46h28M20 38h24M23 30h18" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}
function IconPastry() {
  return (
    <svg viewBox="0 0 64 64" fill="none">
      <path d="M8 30c6-10 16-16 24-16s18 6 24 16c-6 2-9 7-12 7-3 0-4-4-8-4s-5 5-8 5-5-5-8-5-6 4-9 4-6-4-3-7Z" fill="var(--accent-400)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}
const ICONS: Record<string, () => JSX.Element> = { cupHot: IconCupHot, cupCold: IconCupCold, cake: IconCake, pastry: IconPastry };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("ru");
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [showBranchList, setShowBranchList] = useState(false);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null);
  const [sheetVariants, setSheetVariants] = useState<Record<string, number>>({});
  const [sheetQty, setSheetQty] = useState(1);
  const [bellOpen, setBellOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [bellStatus, setBellStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [loading, setLoading] = useState(true);
  const [showLangList, setShowLangList] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    // @ts-ignore
    const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
    tg?.ready?.();
    tg?.expand?.();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    Promise.all([
      fetch(`${API_BASE}/api/branches`).then((r) => r.json()),
      fetch(`${API_BASE}/api/menu`).then((r) => r.json()),
    ])
      .then(([branchesRes, menuRes]: [Branch[], MenuCategory[]]) => {
        setBranches(branchesRes);
        const fromQuery = Number(router.query.branch);
        setBranchId(
          Number.isFinite(fromQuery) && branchesRes.some((b) => b.id === fromQuery)
            ? fromQuery
            : branchesRes[0]?.id ?? null
        );
        setCategories(menuRes);
        setActiveCat(menuRes[0]?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, [router.isReady, router.query.branch]);

  const t = (key: string) => UI[lang][key] ?? key;
  const branch = branches.find((b) => b.id === branchId) ?? null;
  const activeCategory = categories.find((c) => c.id === activeCat) ?? null;

  function telegramUser() {
    // @ts-ignore
    const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
    return tg?.initDataUnsafe?.user as { id: number; username?: string; first_name?: string } | undefined;
  }

  function openProductSheet(item: MenuItem) {
    const defaults: Record<string, number> = {};
    item.variantGroups.forEach(({ variantGroup }) => {
      const first = [...variantGroup.options].sort((a, b) => a.sortOrder - b.sortOrder)[0];
      if (first) defaults[variantGroup.key] = first.id;
    });
    setSheetItem(item);
    setSheetVariants(defaults);
    setSheetQty(1);
  }

  function variantDelta(item: MenuItem, variants: Record<string, number>) {
    let d = 0;
    item.variantGroups.forEach(({ variantGroup }) => {
      const optId = variants[variantGroup.key];
      const opt = variantGroup.options.find((o) => o.id === optId);
      if (opt) d += opt.priceDelta;
    });
    return d;
  }

  const unitPrice = sheetItem ? sheetItem.basePrice + variantDelta(sheetItem, sheetVariants) : 0;

  function addToCart() {
    if (!sheetItem) return;
    const id = `${sheetItem.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setCart((prev) => [...prev, { id, item: sheetItem, variants: sheetVariants, qty: sheetQty, unit: unitPrice }]);
    setSheetItem(null);
  }

  function removeCartLine(id: string) {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }

  function setCartLineQty(id: string, qty: number) {
    if (qty < 1) {
      removeCartLine(id);
      return;
    }
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty } : c)));
  }

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + c.qty * c.unit, 0);

  async function sendTableCall() {
    if (!branchId || !tableNumber.trim()) return;
    const user = telegramUser();
    setBellStatus("sending");
    try {
      const res = await fetch(`${API_BASE}/api/table-calls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          tableNumber: tableNumber.trim(),
          telegramId: user?.id,
          telegramUsername: user?.username,
          telegramFirstName: user?.first_name,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setBellStatus("sent");
    } catch {
      setBellStatus("error");
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="logo-mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Leaf Coffee" />
        </div>
        <div className="brand-block">
          <div className="brand-name">Leaf Coffee</div>
          <button className="branch-pill" onClick={() => setShowBranchList((s) => !s)}>
            {branch ? branchShortName(branch, lang) : t("chooseBranch")}
          </button>
        </div>
        <div className="header-actions">
          <button className="bell-btn" onClick={() => { setBellOpen(true); setBellStatus("idle"); setTableNumber(""); }} aria-label={t("callWaiter")}>
            <span>🔔</span>
          </button>
          <button className="lang-current" onClick={() => setShowLangList((s) => !s)}>
            {lang.toUpperCase()}
          </button>
        </div>
      </div>

      {showLangList && (
        <div className="lang-dropdown" role="group">
          {(["ru", "uz", "en"] as Lang[]).map((l) => (
            <button key={l} data-active={lang === l} onClick={() => { setLang(l); setShowLangList(false); }}>
              {l === "ru" ? "Русский" : l === "uz" ? "O'zbekcha" : "English"}
            </button>
          ))}
        </div>
      )}

      {showBranchList && (
        <div className="branch-list">
          {branches.map((b) => (
            <button
              key={b.id}
              className="branch-option"
              data-active={b.id === branchId}
              onClick={() => { setBranchId(b.id); setShowBranchList(false); }}
            >
              {localized(b, lang)}
              <span className="addr">{lang === "ru" ? b.addressRu : lang === "uz" ? b.addressUz : b.addressEn}</span>
            </button>
          ))}
        </div>
      )}

      <div className="demo-banner">{t("demoBanner")}</div>

      <div className="order-type" role="group">
        <button data-active={orderType === "pickup"} onClick={() => setOrderType("pickup")}>{t("pickup")}</button>
        <button data-active={orderType === "delivery"} onClick={() => setOrderType("delivery")}>{t("delivery")}</button>
      </div>
      <div className="order-hint">{orderType === "pickup" ? t("pickupHint") : t("deliveryHint")}</div>

      {loading ? (
        <div className="empty-state">{t("loading")}</div>
      ) : (
        <>
          <div className="tabs" role="tablist">
            {categories.map((c) => (
              <button key={c.id} data-active={c.id === activeCat} onClick={() => setActiveCat(c.id)}>
                {localized(c, lang)}
              </button>
            ))}
          </div>

          <div className="grid">
            {activeCategory && activeCategory.items.length > 0 ? (
              activeCategory.items.map((item) => {
                const Icon = ICONS[activeCategory.icon] ?? IconCupHot;
                const qtyInCart = cart
                  .filter((c) => c.item.id === item.id)
                  .reduce((s, c) => s + c.qty, 0);
                return (
                  <button key={item.id} className="card" onClick={() => openProductSheet(item)}>
                    <div className="card-icon">
                      <Icon />
                      {qtyInCart > 0 && <span className="card-qty-badge">{qtyInCart}</span>}
                    </div>
                    <div className="card-name">{localized(item, lang)}</div>
                    <div className="card-foot">
                      <span className="card-price tabular">{fmt(item.basePrice, lang)}</span>
                      <span className="card-plus">+</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="empty-state">{t("empty")}</div>
            )}
          </div>
        </>
      )}

      <div className="cartbar">
        {cartCount > 0 && (
          <div className="cartbar-inner">
            <button className="cartbar-summary" onClick={() => setCartOpen(true)}>
              <span className="cartbar-count">
                <span className="cartbar-count-number tabular">{cartCount}</span>{" "}
                {lang === "ru" ? "товар(а)" : lang === "uz" ? "ta mahsulot" : "items"}
              </span>
              <span className="cartbar-total tabular">{fmt(cartTotal, lang)}</span>
            </button>
            <button className="cartbar-btn" onClick={() => alert(t("checkoutSoon"))}>{t("checkout")}</button>
          </div>
        )}
      </div>

      {/* Cart list sheet */}
      <div className={`scrim ${cartOpen ? "open" : ""}`} onClick={() => setCartOpen(false)} />
      <div className={`sheet ${cartOpen ? "open" : ""}`}>
        {cartOpen && (
          <>
            <div className="sheet-handle" />
            <div className="sheet-title" style={{ marginBottom: 14 }}>{t("yourOrder")}</div>
            {cart.length === 0 ? (
              <p style={{ color: "var(--ink-soft)" }}>{t("cartEmpty")}</p>
            ) : (
              <div className="cart-lines">
                {cart.map((line) => {
                  const variantText = cartLineVariantSummary(line, lang);
                  return (
                    <div className="cart-line" key={line.id}>
                      <div className="cart-line-info">
                        <div className="cart-line-name">{localized(line.item, lang)}</div>
                        {variantText && <div className="cart-line-variants">{variantText}</div>}
                        <button className="cart-line-remove" onClick={() => removeCartLine(line.id)}>{t("remove")}</button>
                      </div>
                      <div className="cart-line-right">
                        <div className="stepper">
                          <button onClick={() => setCartLineQty(line.id, line.qty - 1)}>−</button>
                          <span>{line.qty}</span>
                          <button onClick={() => setCartLineQty(line.id, line.qty + 1)}>+</button>
                        </div>
                        <div className="cart-line-price tabular">{fmt(line.qty * line.unit, lang)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {cart.length > 0 && (
              <div className="sheet-footer">
                <button className="add-btn" style={{ width: "100%" }} onClick={() => { setCartOpen(false); alert(t("checkoutSoon")); }}>
                  <span>{t("checkout")}</span>
                  <span className="tabular">{fmt(cartTotal, lang)}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product variant sheet */}
      <div className={`scrim ${sheetItem ? "open" : ""}`} onClick={() => setSheetItem(null)} />
      <div className={`sheet ${sheetItem ? "open" : ""}`}>
        {sheetItem && (
          <>
            <div className="sheet-handle" />
            <div className="sheet-head">
              <div className="sheet-icon">
                {(() => {
                  const Icon = ICONS[activeCategory?.icon ?? "cupHot"] ?? IconCupHot;
                  return <Icon />;
                })()}
              </div>
              <div>
                <div className="sheet-title">{localized(sheetItem, lang)}</div>
                <div className="sheet-base-price tabular">{fmt(sheetItem.basePrice, lang)}</div>
              </div>
            </div>

            {itemDescription(sheetItem, lang) && (
              <p className="sheet-description">{itemDescription(sheetItem, lang)}</p>
            )}

            {sheetItem.variantGroups.map(({ variantGroup }) => (
              <div className="variant-group" key={variantGroup.id}>
                <div className="variant-label">{t(VARIANT_LABEL_KEY[variantGroup.key])}</div>
                <div className="variant-options">
                  {[...variantGroup.options].sort((a, b) => a.sortOrder - b.sortOrder).map((opt) => (
                    <button
                      key={opt.id}
                      data-active={sheetVariants[variantGroup.key] === opt.id}
                      onClick={() => setSheetVariants((prev) => ({ ...prev, [variantGroup.key]: opt.id }))}
                    >
                      {localized(opt, lang)}
                      {opt.priceDelta > 0 && <span className="variant-delta"> +{opt.priceDelta.toLocaleString("ru-RU")}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="sheet-footer">
              <div className="stepper">
                <button onClick={() => setSheetQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{sheetQty}</span>
                <button onClick={() => setSheetQty((q) => Math.min(9, q + 1))}>+</button>
              </div>
              <button className="add-btn" onClick={addToCart}>
                <span>{t("addToCart")}</span>
                <span className="tabular">{fmt(unitPrice * sheetQty, lang)}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bell sheet */}
      <div className={`scrim ${bellOpen ? "open" : ""}`} onClick={() => setBellOpen(false)} />
      <div className={`sheet ${bellOpen ? "open" : ""}`}>
        {bellOpen && (
          <>
            <div className="sheet-handle" />
            <div className="sheet-head">
              <div className="sheet-icon" style={{ fontSize: 28 }}>🔔</div>
              <div>
                <div className="sheet-title">{t("callWaiter")}</div>
              </div>
            </div>
            {bellStatus === "sent" ? (
              <p style={{ marginTop: 18 }}>{t("tableCallSent")}</p>
            ) : (
              <>
                <div className="variant-label" style={{ marginTop: 18 }}>{t("askTableNumber")}</div>
                <input
                  className="table-input"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder={t("tableNumberPlaceholder")}
                  inputMode="numeric"
                />
                {bellStatus === "error" && <p style={{ color: "var(--accent-700)", fontSize: 12, marginTop: 8 }}>{t("tableCallError")}</p>}
                <div className="sheet-footer">
                  <button className="add-btn" style={{ width: "100%" }} onClick={sendTableCall} disabled={bellStatus === "sending"}>
                    <span>{t("callWaiter")}</span>
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
