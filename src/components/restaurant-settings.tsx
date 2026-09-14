"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { AdminMenu } from "./admin-dashboard";

type Locale = "uk" | "pl" | "en";
const languages: Array<{ value: Locale; label: string }> = [
  { value: "uk", label: "Українська" },
  { value: "pl", label: "Polski" },
  { value: "en", label: "English" },
];
const days = [
  { value: "mon", label: "Пн" },
  { value: "tue", label: "Вт" },
  { value: "wed", label: "Ср" },
  { value: "thu", label: "Чт" },
  { value: "fri", label: "Пт" },
  { value: "sat", label: "Сб" },
  { value: "sun", label: "Нд" },
];

export default function RestaurantSettings({
  apiUrl,
  slug,
  menu,
  onSaved,
  onDirtyChange,
}: {
  apiUrl: string;
  slug: string;
  menu: AdminMenu;
  onSaved: () => Promise<unknown>;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [form, setForm] = useState({
    name: menu.name,
    description: menu.description ?? "",
    logoUrl: menu.logo_url ?? "",
    address: menu.address,
    phone: menu.phone ?? "",
    contactEmail: menu.contact_email ?? "",
    instagram: menu.instagram ?? "",
    website: menu.website ?? "",
    currency: menu.currency,
    primaryColor: menu.primary_color,
    enabledLocales: menu.enabled_locales,
    defaultLocale: menu.default_locale,
    openFrom: menu.open_from?.slice(0, 5) ?? "08:00",
    openUntil: menu.open_until?.slice(0, 5) ?? "21:00",
    closedDays: menu.closed_days ?? [],
  });
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const savedForm = {
    name: menu.name, description: menu.description ?? "", logoUrl: menu.logo_url ?? "",
    address: menu.address, phone: menu.phone ?? "", contactEmail: menu.contact_email ?? "",
    instagram: menu.instagram ?? "", website: menu.website ?? "", currency: menu.currency,
    primaryColor: menu.primary_color, enabledLocales: menu.enabled_locales,
    defaultLocale: menu.default_locale, openFrom: menu.open_from?.slice(0, 5) ?? "08:00",
    openUntil: menu.open_until?.slice(0, 5) ?? "21:00", closedDays: menu.closed_days ?? [],
  };
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);

  useEffect(() => {
    onDirtyChange(isDirty);
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [isDirty, onDirtyChange]);

  async function uploadLogo(file: File) {
    setUploadingLogo(true);
    setStatus("");
    try {
      const body = new FormData();
      body.append("image", file);
      const response = await fetch(`${apiUrl}/api/admin/uploads`, {
        method: "POST",
        credentials: "include",
        body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Не вдалося завантажити логотип");
      setForm((current) => ({ ...current, logoUrl: result.data.imageUrl }));
      setStatus("Логотип завантажено — натисніть «Зберегти налаштування»");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Помилка завантаження");
    } finally {
      setUploadingLogo(false);
    }
  }

  function toggleLocale(locale: Locale) {
    const enabledLocales = form.enabledLocales.includes(locale)
      ? form.enabledLocales.filter((item) => item !== locale)
      : [...form.enabledLocales, locale];
    if (enabledLocales.length === 0) return;
    setForm({
      ...form,
      enabledLocales,
      defaultLocale: enabledLocales.includes(form.defaultLocale)
        ? form.defaultLocale
        : enabledLocales[0],
    });
  }
  function toggleDay(day: string) {
    setForm({
      ...form,
      closedDays: form.closedDays.includes(day)
        ? form.closedDays.filter((item) => item !== day)
        : [...form.closedDays, day],
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch(`${apiUrl}/api/admin/restaurants/${slug}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message ?? "Не вдалося зберегти налаштування");
      await onSaved();
      setStatus("Налаштування збережено");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Сталася помилка");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-12 rounded-xl border border-black/15 bg-white px-4 text-sm font-normal outline-none focus:border-[var(--brand)]";
  return (
    <div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-black/40">
          Профіль бізнесу
        </p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
          Налаштування закладу
        </h1>
        <p className="mt-3 text-sm text-black/50">
          Контакти, мови й графік, які бачать ваші гості.
        </p>
      </div>
      <form id="restaurant-settings-form" className="mt-8 grid gap-6" onSubmit={submit}>
        <section className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7">
          <h2 className="font-serif text-2xl">Основна інформація</h2>
          <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-[#f3f1ed] p-4 sm:flex-row sm:items-center">
            <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--brand)] font-serif text-2xl text-white">
              {form.logoUrl ? <Image className="object-cover" src={form.logoUrl} alt={`Логотип ${form.name}`} fill sizes="80px" unoptimized /> : form.name.charAt(0)}
            </div>
            <label className="grid min-w-0 gap-2 text-xs font-semibold">Логотип або аватарка
              <input className="w-full rounded-xl border border-black/15 bg-white p-2 text-xs font-normal" accept="image/jpeg,image/png,image/webp" type="file" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadLogo(file); }} />
              <span className="font-normal text-black/40">Квадратне фото виглядатиме найкраще · JPG, PNG або WEBP{uploadingLogo ? " · завантажуємо…" : ""}</span>
            </label>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-semibold">
              Назва закладу
              <input
                className={inputClass}
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold">
              Адреса
              <input
                className={inputClass}
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold sm:col-span-2">
              Короткий опис
              <textarea
                className="min-h-24 rounded-xl border border-black/15 p-4 text-sm font-normal"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold">
              Валюта
              <select
                className={inputClass}
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                {["PLN", "EUR", "USD", "UAH", "CZK"].map((currency) => (
                  <option key={currency}>{currency}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-semibold">
              Колір бренду
              <div className="flex h-12 items-center gap-3 rounded-xl border border-black/15 px-3">
                <input
                  className="size-8"
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) =>
                    setForm({ ...form, primaryColor: e.target.value })
                  }
                />
                <span className="text-sm font-normal uppercase">
                  {form.primaryColor}
                </span>
              </div>
            </label>
          </div>
        </section>
        <section className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7">
          <h2 className="font-serif text-2xl">Мови меню</h2>
          <p className="mt-2 text-sm text-black/45">
            Оберіть від однієї до трьох мов. У формах меню показуватимуться поля
            лише для них.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {languages.map((language) => (
              <label
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${form.enabledLocales.includes(language.value) ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-black/15"}`}
                key={language.value}
              >
                <input
                  className="sr-only"
                  type="checkbox"
                  checked={form.enabledLocales.includes(language.value)}
                  onChange={() => toggleLocale(language.value)}
                />
                {language.label}
              </label>
            ))}
          </div>
          {form.enabledLocales.length > 1 ? (
            <label className="mt-5 grid max-w-xs gap-2 text-xs font-semibold">
              Основна мова
              <select
                className={inputClass}
                value={form.defaultLocale}
                onChange={(e) =>
                  setForm({ ...form, defaultLocale: e.target.value as Locale })
                }
              >
                {languages
                  .filter((language) =>
                    form.enabledLocales.includes(language.value),
                  )
                  .map((language) => (
                    <option key={language.value} value={language.value}>
                      {language.label}
                    </option>
                  ))}
              </select>
            </label>
          ) : null}
        </section>
        <section className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7">
          <h2 className="font-serif text-2xl">Контакти</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-semibold">
              Телефон
              <input
                className={inputClass}
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold">
              Email
              <input
                className={inputClass}
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm({ ...form, contactEmail: e.target.value })
                }
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold">
              Instagram
              <input
                className={inputClass}
                placeholder="@yourcafe"
                value={form.instagram}
                onChange={(e) =>
                  setForm({ ...form, instagram: e.target.value })
                }
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold">
              Сайт
              <input
                className={inputClass}
                placeholder="https://"
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </label>
          </div>
        </section>
        <section className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7">
          <h2 className="font-serif text-2xl">Графік роботи</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-semibold">
              Відчиняємось
              <input
                className={inputClass}
                type="time"
                value={form.openFrom}
                onChange={(e) => setForm({ ...form, openFrom: e.target.value })}
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold">
              Зачиняємось
              <input
                className={inputClass}
                type="time"
                value={form.openUntil}
                onChange={(e) =>
                  setForm({ ...form, openUntil: e.target.value })
                }
              />
            </label>
          </div>
          <fieldset className="mt-5">
            <legend className="text-xs font-semibold">Вихідні дні</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {days.map((day) => (
                <label
                  className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${form.closedDays.includes(day.value) ? "border-red-200 bg-red-50 text-red-700" : "border-black/15"}`}
                  key={day.value}
                >
                  <input
                    className="sr-only"
                    type="checkbox"
                    checked={form.closedDays.includes(day.value)}
                    onChange={() => toggleDay(day.value)}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </fieldset>
        </section>
        {status ? (
          <p
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
            role="status"
          >
            {status}
          </p>
        ) : null}
        <button
          className="w-fit rounded-full bg-[var(--brand)] px-7 py-4 text-sm font-semibold text-white disabled:opacity-50"
          disabled={saving || uploadingLogo}
        >
          {saving ? "Зберігаємо…" : "Зберегти налаштування"}
        </button>
        {isDirty ? <p className="text-xs font-semibold text-amber-700" role="status">Є незбережені зміни</p> : null}
      </form>
    </div>
  );
}
