"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const businessTypes = [
  { value: "cafe", label: "Кав’ярня" },
  { value: "restaurant", label: "Ресторан" },
  { value: "pizzeria", label: "Піцерія" },
  { value: "bakery", label: "Пекарня" },
];

const languages = [
  { value: "uk", label: "Українська" },
  { value: "pl", label: "Polski" },
  { value: "en", label: "English" },
] as const;

const currencies = ["PLN", "EUR", "USD", "UAH", "CZK"];

function createSlug(value: string) {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie',
    ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l',
    м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
    ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'iu', я: 'ia',
  };
  return value
    .toLowerCase()
    .trim()
    .split('')
    .map((letter) => map[letter] ?? letter)
    .join('')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewBusinessForm({ apiUrl }: { apiUrl: string }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    address: "",
    businessType: "cafe",
    currency: "PLN",
    primaryColor: "#1f392d",
    openUntil: "21:00",
    enabledLocales: ["uk"],
    defaultLocale: "uk",
  });

  useEffect(() => {
    fetch(`${apiUrl}/api/auth/me`, { credentials: "include" }).then(
      (response) => {
        if (response.status === 401) router.replace("/login");
      },
    );
  }, [apiUrl, router]);

  function toggleLanguage(locale: string) {
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/api/admin/restaurants`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message ?? "Не вдалося створити заклад");
      router.push(`/admin/${result.data.slug}`);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Сталася помилка",
      );
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f1ed] px-4 py-10 text-[#211f1c] sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          className="text-xs font-semibold text-black/50"
          href="/dashboard"
        >
          ← До моїх закладів
        </Link>
        <div className="mt-7">
          <p className="text-xs uppercase tracking-[.18em] text-black/40">
            Новий клієнт
          </p>
          <h1 className="mt-2 font-serif text-4xl sm:text-6xl">
            Створити заклад
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
            Після створення ви отримаєте окреме меню, адмінпанель, стартові
            категорії та постійний QR-код.
          </p>
        </div>
        <form
          className="mt-8 rounded-3xl border border-black/10 bg-white p-5 sm:p-8"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-semibold">
              Назва закладу
              <input
                className="h-12 rounded-xl border border-black/15 px-4 text-sm font-normal"
                required
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setForm({ ...form, name, slug: createSlug(name) });
                }}
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold">
              Адреса меню
              <input
                className="h-12 rounded-xl border border-black/15 px-4 text-sm font-normal"
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                required
                value={form.slug}
                onChange={(event) =>
                  setForm({ ...form, slug: createSlug(event.target.value) })
                }
              />
              <span className="font-normal text-black/35">
                /{form.slug || "your-business"}
              </span>
            </label>
            <label className="grid gap-2 text-xs font-semibold">
              Тип закладу
              <select
                className="h-12 rounded-xl border border-black/15 bg-white px-4 text-sm font-normal"
                value={form.businessType}
                onChange={(event) =>
                  setForm({ ...form, businessType: event.target.value })
                }
              >
                {businessTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-semibold">
              Валюта
              <select
                className="h-12 rounded-xl border border-black/15 bg-white px-4 text-sm font-normal"
                value={form.currency}
                onChange={(event) =>
                  setForm({ ...form, currency: event.target.value })
                }
              >
                {currencies.map((currency) => (
                  <option key={currency}>{currency}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-semibold">
              Адреса
              <input
                className="h-12 rounded-xl border border-black/15 px-4 text-sm font-normal"
                required
                value={form.address}
                onChange={(event) =>
                  setForm({ ...form, address: event.target.value })
                }
              />
            </label>
            <fieldset className="grid gap-3 sm:col-span-2">
              <legend className="text-xs font-semibold">Мови меню</legend>
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => (
                  <label
                    className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${form.enabledLocales.includes(language.value) ? "border-[#1f392d] bg-[#1f392d] text-white" : "border-black/15"}`}
                    key={language.value}
                  >
                    <input
                      className="sr-only"
                      checked={form.enabledLocales.includes(language.value)}
                      type="checkbox"
                      onChange={() => toggleLanguage(language.value)}
                    />
                    {language.label}
                  </label>
                ))}
              </div>
              <p className="text-xs text-black/40">
                Поля страв з’являться лише для вибраних мов.
              </p>
            </fieldset>
            {form.enabledLocales.length > 1 ? (
              <label className="grid gap-2 text-xs font-semibold">
                Основна мова
                <select
                  className="h-12 rounded-xl border border-black/15 bg-white px-4 text-sm font-normal"
                  value={form.defaultLocale}
                  onChange={(event) =>
                    setForm({ ...form, defaultLocale: event.target.value })
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
            <label className="grid gap-2 text-xs font-semibold sm:col-span-2">
              Короткий опис
              <input
                className="h-12 rounded-xl border border-black/15 px-4 text-sm font-normal"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold">
              Колір бренду
              <div className="flex h-12 items-center gap-3 rounded-xl border border-black/15 px-3">
                <input
                  className="size-8 border-0 bg-transparent"
                  type="color"
                  value={form.primaryColor}
                  onChange={(event) =>
                    setForm({ ...form, primaryColor: event.target.value })
                  }
                />
                <span className="text-sm font-normal uppercase">
                  {form.primaryColor}
                </span>
              </div>
            </label>
            <label className="grid gap-2 text-xs font-semibold">
              Відчинено до
              <input
                className="h-12 rounded-xl border border-black/15 px-4 text-sm font-normal"
                type="time"
                value={form.openUntil}
                onChange={(event) =>
                  setForm({ ...form, openUntil: event.target.value })
                }
              />
            </label>
          </div>
          {error ? (
            <p
              className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <button
            className="mt-7 w-full rounded-full bg-[#1f392d] px-6 py-4 text-sm font-semibold text-white disabled:opacity-50"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Створюємо…" : "Створити заклад і QR-код"}
          </button>
        </form>
      </div>
    </main>
  );
}
