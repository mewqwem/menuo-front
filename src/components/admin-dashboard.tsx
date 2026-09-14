"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, FormEvent } from "react";
import { useCallback, useState } from "react";
import RestaurantSettings from "./restaurant-settings";

type Locale = "uk" | "pl" | "en";
type AdminItem = {
  id: number;
  nameUk: string;
  namePl: string;
  nameEn: string;
  descriptionUk: string;
  descriptionPl: string;
  descriptionEn: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string;
  isPopular: boolean;
  isNew: boolean;
  isVegan: boolean;
  isAvailable: boolean;
};
type AdminCategory = {
  id: string;
  name_uk: string;
  name_pl: string;
  name_en: string;
  items: AdminItem[];
};
export type AdminMenu = {
  slug: string;
  name: string;
  description: string;
  address: string;
  currency: string;
  logo_url: string | null;
  primary_color: string;
  enabled_locales: Locale[];
  default_locale: Locale;
  phone: string | null;
  contact_email: string | null;
  instagram: string | null;
  website: string | null;
  open_from: string;
  open_until: string;
  closed_days: string[];
  categories: AdminCategory[];
};
type Props = {
  apiUrl: string;
  slug: string;
  initialMenu: AdminMenu;
  qrCode: string;
  menuUrl: string;
};

const localeFields = {
  uk: { label: "Українська", name: "nameUk", description: "descriptionUk" },
  pl: { label: "Polski", name: "namePl", description: "descriptionPl" },
  en: { label: "English", name: "nameEn", description: "descriptionEn" },
} as const;
const currencySymbols: Record<string, string> = {
  PLN: "zł",
  EUR: "€",
  USD: "$",
  UAH: "₴",
  CZK: "Kč",
};
const emptyItem = {
  categoryId: "",
  nameUk: "",
  namePl: "",
  nameEn: "",
  descriptionUk: "",
  descriptionPl: "",
  descriptionEn: "",
  price: "",
  imageUrl: "",
  isPopular: false,
};
const emptyCategory = { nameUk: "", namePl: "", nameEn: "" };

export default function AdminDashboard({
  apiUrl,
  slug,
  initialMenu,
  qrCode,
  menuUrl,
}: Props) {
  const [menu, setMenu] = useState(initialMenu);
  const [form, setForm] = useState({
    ...emptyItem,
    categoryId: initialMenu.categories[0]?.id ?? "",
  });
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [section, setSection] = useState<"overview" | "menu" | "settings">(
    "menu",
  );
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [pendingSection, setPendingSection] = useState<"overview" | "menu" | null>(null);
  const items = menu.categories.flatMap((category) =>
    category.items.map((item) => ({ ...item, categoryName: category.name_uk })),
  );
  const currency = currencySymbols[menu.currency] ?? menu.currency;
  const themeStyle = { "--brand": menu.primary_color } as CSSProperties;
  const navigation = [
    { id: "overview", label: "Огляд", mobile: "Огляд", icon: "⌂" },
    { id: "menu", label: "Налаштування меню", mobile: "Меню", icon: "☷" },
    { id: "settings", label: "Налаштування закладу", mobile: "Заклад", icon: "⚙" },
  ] as const;
  const navigationIndex = navigation.findIndex((item) => item.id === section);
  const handleDirtyChange = useCallback((dirty: boolean) => setSettingsDirty(dirty), []);

  function navigateTo(nextSection: "overview" | "menu" | "settings") {
    if (section === "settings" && settingsDirty && nextSection !== "settings") {
      setPendingSection(nextSection);
      return;
    }
    setSection(nextSection);
  }

  async function handleSettingsSaved() {
    await refreshMenu();
    setSettingsDirty(false);
    if (pendingSection) {
      setSection(pendingSection);
      setPendingSection(null);
    }
  }

  async function refreshMenu() {
    const response = await fetch(`${apiUrl}/api/admin/restaurants/${slug}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Не вдалося оновити меню");
    const result = await response.json();
    setMenu(result.data);
    return result.data as AdminMenu;
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    setMessage("");
    try {
      const body = new FormData();
      body.append("image", file);
      const response = await fetch(`${apiUrl}/api/admin/uploads`, {
        method: "POST",
        body,
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message ?? "Не вдалося завантажити фото");
      setForm((current) => ({ ...current, imageUrl: result.data.imageUrl }));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Помилка завантаження",
      );
    } finally {
      setUploading(false);
    }
  }

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      const response = await fetch(
        `${apiUrl}/api/admin/restaurants/${slug}/categories`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryForm),
        },
      );
      if (!response.ok) throw new Error("Не вдалося створити категорію");
      const updated = await refreshMenu();
      setCategoryForm(emptyCategory);
      setIsCategoryFormOpen(false);
      setForm((current) => ({
        ...current,
        categoryId: current.categoryId || updated.categories.at(-1)?.id || "",
      }));
      setMessage("Категорію створено");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Сталася помилка");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeCategory(id: string) {
    if (!window.confirm("Видалити порожню категорію?")) return;
    const response = await fetch(
      `${apiUrl}/api/admin/restaurants/${slug}/categories/${id}`,
      { method: "DELETE", credentials: "include" },
    );
    if (!response.ok) {
      const result = await response.json();
      setMessage(result.message ?? "Спочатку видаліть позиції категорії");
      return;
    }
    const updated = await refreshMenu();
    setForm((current) => ({
      ...current,
      categoryId: updated.categories[0]?.id ?? "",
    }));
    setMessage("Категорію видалено");
  }

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      const response = await fetch(
        `${apiUrl}/api/admin/restaurants/${slug}/items`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, price: Number(form.price) }),
        },
      );
      if (!response.ok) throw new Error("Не вдалося додати позицію");
      const updated = await refreshMenu();
      setForm({ ...emptyItem, categoryId: updated.categories[0]?.id ?? "" });
      setIsItemFormOpen(false);
      setMessage("Позицію додано до меню");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Сталася помилка");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateItem(id: number, updates: Partial<AdminItem>) {
    setMessage("");
    const response = await fetch(`${apiUrl}/api/admin/items/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      setMessage("Не вдалося змінити позицію");
      return;
    }
    await refreshMenu();
  }

  async function removeItem(id: number) {
    if (!window.confirm("Видалити цю позицію без можливості відновлення?"))
      return;
    const response = await fetch(`${apiUrl}/api/admin/items/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      setMessage("Не вдалося видалити позицію");
      return;
    }
    await refreshMenu();
    setMessage("Позицію видалено");
  }

  return (
    <main
      className="min-h-screen bg-[#f3f1ed] text-[#211f1c]"
      style={themeStyle}
    >
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:h-18 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--brand)] font-serif text-sm text-white">
              {menu.logo_url ? <Image className="object-cover" src={menu.logo_url} alt={`Логотип ${menu.name}`} fill sizes="36px" unoptimized /> : menu.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <strong className="block truncate text-sm">{menu.name}</strong>
              <span className="hidden text-[10px] text-black/45 sm:block">
                Керування закладом
              </span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              className="hidden rounded-full border border-black/10 px-3 py-2 text-xs font-semibold sm:block"
              href="/admin/new"
            >
              + Заклад
            </Link>
            <Link
              className="rounded-full bg-black/5 px-3 py-2 text-[11px] font-semibold sm:border sm:border-black/10 sm:bg-transparent sm:text-xs"
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sm:hidden">Перегляд ↗</span>
              <span className="hidden sm:inline">Відкрити меню ↗</span>
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-3 py-5 pb-28 sm:px-6 md:grid-cols-[220px_1fr] md:py-10 md:pb-10">
        <aside className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:sticky md:inset-auto md:top-24 md:h-fit md:rounded-2xl md:border md:p-2">
          <nav
            className="admin-nav relative isolate grid grid-cols-3 p-1 md:auto-rows-[3rem] md:grid-cols-1"
            aria-label="Адмін-навігація"
            style={{ "--nav-index": navigationIndex } as CSSProperties}
          >
            <span className="admin-nav-bubble" aria-hidden="true" />
            {navigation.map((item) => (
              <button
                className={`pressable relative z-10 flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center text-[10px] font-semibold md:min-h-0 md:flex-row md:justify-start md:gap-3 md:px-4 md:py-3 md:text-left md:text-sm ${section === item.id ? "text-white" : "hover:bg-black/5"}`}
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
              >
                <span
                  className="text-base leading-none md:text-sm"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span className="md:hidden">{item.mobile}</span>
                <span className="hidden md:inline">{item.label}</span>
              </button>
            ))}
          </nav>
          <Link
            className="mt-2 hidden rounded-xl px-4 py-3 text-sm text-black/45 hover:bg-black/5 md:block"
            href="/dashboard"
          >
            ← Усі заклади
          </Link>
        </aside>
        <div className="min-w-0">
          {section === "overview" ? (
            <div className="section-enter" key="overview">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-black/40">
                Панель керування
              </p>
              <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
                {menu.name}
              </h1>
              <p className="mt-3 text-sm text-black/50">
                Швидкий огляд вашого цифрового меню.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="reveal-card rounded-3xl bg-white p-6" style={{ animationDelay: "60ms" }}>
                  <span className="text-xs text-black/40">Позицій</span>
                  <strong className="mt-3 block font-serif text-4xl">
                    {items.length}
                  </strong>
                </div>
                <div className="reveal-card rounded-3xl bg-white p-6" style={{ animationDelay: "120ms" }}>
                  <span className="text-xs text-black/40">Категорій</span>
                  <strong className="mt-3 block font-serif text-4xl">
                    {menu.categories.length}
                  </strong>
                </div>
                <div className="reveal-card rounded-3xl bg-white p-6" style={{ animationDelay: "180ms" }}>
                  <span className="text-xs text-black/40">Мов</span>
                  <strong className="mt-3 block font-serif text-4xl">
                    {menu.enabled_locales.length}
                  </strong>
                </div>
              </div>
              <aside className="mt-6 flex max-w-sm items-center gap-4 rounded-2xl border border-black/10 bg-white p-3">
                <Image
                  className="size-24 rounded-lg"
                  src={qrCode}
                  alt={`QR-код меню ${menu.name}`}
                  width={96}
                  height={96}
                  unoptimized
                />
                <div className="min-w-0">
                  <strong className="text-sm">QR-код меню</strong>
                  <p className="mt-1 truncate text-[10px] text-black/40">
                    {menuUrl}
                  </p>
                  <a
                    className="mt-2 inline-block text-xs font-semibold underline"
                    download={`${slug}-qr.png`}
                    href={qrCode}
                  >
                    Завантажити
                  </a>
                </div>
              </aside>
            </div>
          ) : null}
          {section === "settings" ? (
            <div className="section-enter" key="settings"><RestaurantSettings apiUrl={apiUrl} slug={slug} menu={menu} onSaved={handleSettingsSaved} onDirtyChange={handleDirtyChange} /></div>
          ) : null}
          {section === "menu" ? (
            <div className="section-enter" key="menu">
              <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="truncate text-xs text-black/45">
                      {menu.address}
                    </p>
                    <h1 className="mt-2 font-serif text-3xl sm:text-5xl">
                      Позиції меню
                    </h1>
                    <p className="mt-2 text-sm text-black/50">
                      {items.length} позицій у {menu.categories.length}{" "}
                      категоріях
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button
                      className="rounded-full border border-black/15 bg-white px-3 py-3 text-xs font-semibold sm:px-5 sm:text-sm"
                      type="button"
                      onClick={() => setIsCategoryFormOpen((v) => !v)}
                    >
                      + Категорія
                    </button>
                    <button
                      className="rounded-full bg-[var(--brand)] px-3 py-3 text-xs font-semibold text-white disabled:opacity-40 sm:px-5 sm:text-sm"
                      disabled={menu.categories.length === 0}
                      type="button"
                      onClick={() => setIsItemFormOpen((v) => !v)}
                    >
                      + Позиція
                    </button>
                  </div>
                </div>
                <aside className="flex min-w-0 items-center gap-3 rounded-2xl border border-black/10 bg-white p-3">
                  <Image
                    className="size-16 shrink-0 rounded-lg sm:size-20"
                    src={qrCode}
                    alt={`QR-код меню ${menu.name}`}
                    width={80}
                    height={80}
                    unoptimized
                  />
                  <div className="min-w-0">
                    <strong className="text-sm">QR-код меню</strong>
                    <p className="mt-1 truncate text-[10px] text-black/40">
                      {menuUrl}
                    </p>
                    <a
                      className="mt-2 inline-block text-xs font-semibold underline"
                      download={`${slug}-qr.png`}
                      href={qrCode}
                    >
                      Завантажити
                    </a>
                  </div>
                </aside>
              </div>
              {message ? (
                <p
                  className="mt-5 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
                  role="status"
                >
                  {message}
                </p>
              ) : null}
              <section className="mt-7 rounded-3xl border border-black/10 bg-white p-5 sm:p-7">
                <h2 className="font-serif text-2xl">Категорії</h2>
                <p className="mt-1 text-xs text-black/45">
                  Ви самі визначаєте структуру меню.
                </p>
                {isCategoryFormOpen ? (
                  <form
                    className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                    onSubmit={addCategory}
                  >
                    {menu.enabled_locales.map((locale) => {
                      const field = localeFields[locale].name;
                      return (
                        <label
                          className="grid gap-2 text-xs font-semibold"
                          key={locale}
                        >
                          Назва · {localeFields[locale].label}
                          <input
                            className="h-11 rounded-xl border border-black/15 px-3 text-sm font-normal"
                            required={locale === menu.default_locale}
                            value={categoryForm[field]}
                            onChange={(e) =>
                              setCategoryForm({
                                ...categoryForm,
                                [field]: e.target.value,
                              })
                            }
                          />
                        </label>
                      );
                    })}
                    <button
                      className="h-11 self-end rounded-full bg-[var(--brand)] px-5 text-sm font-semibold text-white"
                      disabled={isSaving}
                      type="submit"
                    >
                      Створити
                    </button>
                  </form>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-2">
                  {menu.categories.length ? (
                    menu.categories.map((category) => (
                      <span
                        className="flex items-center gap-2 rounded-full bg-[#f3f1ed] py-2 pl-4 pr-2 text-sm"
                        key={category.id}
                      >
                        {category.name_uk}
                        <button
                          className="grid size-7 place-items-center rounded-full bg-white text-black/45 hover:text-red-600"
                          type="button"
                          aria-label={`Видалити ${category.name_uk}`}
                          onClick={() => removeCategory(category.id)}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-black/45">
                      Категорій ще немає — створіть першу.
                    </p>
                  )}
                </div>
                <button
                  className="mt-5 rounded-full border border-black/15 px-5 py-2 text-sm font-semibold"
                  type="button"
                  onClick={() => setIsCategoryFormOpen((v) => !v)}
                >
                  {isCategoryFormOpen ? "Закрити" : "+ Створити категорію"}
                </button>
              </section>
              {isItemFormOpen ? (
                <form
                  className="mt-7 rounded-3xl border border-black/10 bg-white p-5 sm:p-7"
                  onSubmit={addItem}
                >
                  <h2 className="font-serif text-2xl">Нова позиція</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="grid gap-2 text-xs font-semibold">
                      Категорія
                      <select
                        className="h-11 rounded-xl border border-black/15 bg-white px-3 text-sm font-normal"
                        value={form.categoryId}
                        onChange={(e) =>
                          setForm({ ...form, categoryId: e.target.value })
                        }
                      >
                        {menu.categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name_uk}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-xs font-semibold">
                      Ціна, {currency}
                      <input
                        className="h-11 rounded-xl border border-black/15 px-3 text-sm font-normal"
                        min="0"
                        step="0.01"
                        required
                        type="number"
                        value={form.price}
                        onChange={(e) =>
                          setForm({ ...form, price: e.target.value })
                        }
                      />
                    </label>
                    <label className="grid gap-2 text-xs font-semibold">
                      Фото з комп’ютера
                      <input
                        className="h-11 rounded-xl border border-black/15 p-2 text-xs font-normal"
                        accept="image/jpeg,image/png,image/webp"
                        required={!form.imageUrl}
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void uploadPhoto(file);
                        }}
                      />
                      <span className="font-normal text-black/40">
                        JPG, PNG або WEBP, до 5 MB
                        {uploading
                          ? " · завантажуємо…"
                          : form.imageUrl
                            ? " · готово ✓"
                            : ""}
                      </span>
                    </label>
                    {menu.enabled_locales.map((locale) => {
                      const fields = localeFields[locale];
                      return (
                        <div
                          className="grid gap-4 sm:col-span-2 lg:col-span-3 lg:grid-cols-2"
                          key={locale}
                        >
                          <label className="grid gap-2 text-xs font-semibold">
                            Назва · {fields.label}
                            <input
                              className="h-11 rounded-xl border border-black/15 px-3 text-sm font-normal"
                              required={locale === menu.default_locale}
                              value={form[fields.name]}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  [fields.name]: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="grid gap-2 text-xs font-semibold">
                            Опис · {fields.label}
                            <textarea
                              className="min-h-20 rounded-xl border border-black/15 p-3 text-sm font-normal"
                              value={form[fields.description]}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  [fields.description]: e.target.value,
                                })
                              }
                            />
                          </label>
                        </div>
                      );
                    })}
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        checked={form.isPopular}
                        type="checkbox"
                        onChange={(e) =>
                          setForm({ ...form, isPopular: e.target.checked })
                        }
                      />{" "}
                      Позначити як хіт ★
                    </label>
                  </div>
                  <button
                    className="mt-6 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    disabled={isSaving || uploading || !form.imageUrl}
                    type="submit"
                  >
                    {isSaving ? "Зберігаємо…" : "Зберегти позицію"}
                  </button>
                </form>
              ) : null}
              <div className="mt-8 overflow-hidden rounded-3xl border border-black/10 bg-white">
                <div className="hidden grid-cols-[1fr_130px_190px] border-b border-black/10 bg-[#faf9f6] px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-black/40 sm:grid">
                  <span>Позиція</span>
                  <span>Ціна</span>
                  <span>Керування</span>
                </div>
                {items.map((item) => (
                  <article
                    className={`grid gap-4 border-b border-black/8 p-4 last:border-0 sm:grid-cols-[1fr_130px_190px] sm:items-center sm:px-6 ${item.isAvailable ? "" : "opacity-50"}`}
                    key={item.id}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-black/5">
                        <Image
                          className="object-cover"
                          src={item.imageUrl}
                          alt=""
                          fill
                          sizes="64px"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate font-serif text-lg">
                          {item.nameUk}
                        </h2>
                        <p className="mt-1 text-xs text-black/45">
                          {item.categoryName}
                          {item.isPopular ? " · Хіт ★" : ""}
                        </p>
                      </div>
                    </div>
                    <strong className="text-sm">
                      {item.price} {currency}
                    </strong>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-full border border-black/10 px-3 py-2 text-[11px]"
                        type="button"
                        onClick={() =>
                          updateItem(item.id, {
                            isAvailable: !item.isAvailable,
                          })
                        }
                      >
                        {item.isAvailable ? "Приховати" : "Показати"}
                      </button>
                      <button
                        className={`rounded-full border px-3 py-2 text-[11px] font-bold ${item.isPopular ? "border-amber-400 bg-amber-100 text-amber-700" : "border-black/10 text-black/35"}`}
                        type="button"
                        aria-pressed={item.isPopular}
                        aria-label={
                          item.isPopular
                            ? "Прибрати з хітів"
                            : "Додати до хітів"
                        }
                        onClick={() =>
                          updateItem(item.id, { isPopular: !item.isPopular })
                        }
                      >
                        ★
                      </button>
                      <button
                        className="rounded-full border border-red-200 px-3 py-2 text-[11px] text-red-700"
                        type="button"
                        onClick={() => removeItem(item.id)}
                      >
                        Видалити
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {pendingSection ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingSection(null); }}>
          <div className="section-enter w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="unsaved-title">
            <span className="grid size-11 place-items-center rounded-full bg-amber-100 text-xl" aria-hidden="true">!</span>
            <h2 className="mt-5 font-serif text-3xl" id="unsaved-title">Зберегти зміни?</h2>
            <p className="mt-3 text-sm leading-6 text-black/50">У налаштуваннях закладу є зміни, які ще не збережені.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button className="pressable rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white" type="button" onClick={() => (document.getElementById("restaurant-settings-form") as HTMLFormElement | null)?.requestSubmit()}>Зберегти й перейти</button>
              <button className="pressable rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-700" type="button" onClick={() => { setSettingsDirty(false); setSection(pendingSection); setPendingSection(null); }}>Вийти без збереження</button>
            </div>
            <button className="mt-3 w-full px-5 py-2 text-sm text-black/45" type="button" onClick={() => setPendingSection(null)}>Залишитися тут</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
