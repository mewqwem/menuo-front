"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { dictionary, Locale, MenuData } from "./menu-data";

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

type MenuExperienceProps = {
  data: MenuData;
};

export default function MenuExperience({ data }: MenuExperienceProps) {
  const { cafe, categories, menuItems } = data;
  const themeStyle = { "--brand": cafe.primaryColor } as CSSProperties;
  const locales = cafe.enabledLocales;
  const [locale, setLocale] = useState<Locale>(cafe.defaultLocale);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const t = dictionary[locale];
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
    return hours * 60 + minutes;
  };
  const opensAt = toMinutes(cafe.openFrom);
  const closesAt = toMinutes(cafe.openUntil);
  const isOpenByTime = opensAt <= closesAt
    ? currentMinutes >= opensAt && currentMinutes < closesAt
    : currentMinutes >= opensAt || currentMinutes < closesAt;
  const isClosedDay = cafe.closedDays.includes(dayKeys[now.getDay()]);
  const isClosed = isClosedDay || !isOpenByTime;

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(locale);

    return menuItems.filter((item) => {
      const belongsToCategory =
        category === "all" ||
        (category === "popular"
          ? item.badges?.includes("popular")
          : item.categoryId === category);
      const matchesQuery =
        !normalizedQuery ||
        `${item.name[locale]} ${item.description[locale]}`
          .toLocaleLowerCase(locale)
          .includes(normalizedQuery);

      return belongsToCategory && matchesQuery;
    });
  }, [category, locale, menuItems, query]);
  const countLabel = locale === "uk"
    ? (visibleItems.length % 10 === 1 && visibleItems.length % 100 !== 11
      ? "позиція"
      : [2, 3, 4].includes(visibleItems.length % 10) && ![12, 13, 14].includes(visibleItems.length % 100)
        ? "позиції"
        : "позицій")
    : t.found;
  const instagramUrl = cafe.instagram ? `https://instagram.com/${cafe.instagram.replace(/^@/, "")}` : null;

  return (
    <main
      className="page-enter min-h-screen bg-[#f7f3ed] text-[#201a17]"
      style={themeStyle}
    >
      <header className="sticky top-0 z-50 border-b border-black/8 bg-[#f7f3ed]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a
            className="flex items-center gap-3"
            href="#menu"
            aria-label={`${cafe.name} home`}
          >
            <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--brand)] font-serif text-sm text-[#f5e8c8]">
              {cafe.logoUrl ? (
                <Image
                  className="object-cover"
                  src={cafe.logoUrl}
                  alt={`Логотип ${cafe.name}`}
                  fill
                  sizes="40px"
                  unoptimized
                />
              ) : (
                cafe.name.charAt(0)
              )}
            </span>
            <span>
              <strong className="block font-serif text-xl leading-none tracking-[0.14em]">
                {cafe.name}
              </strong>
              <small className="mt-1 block max-w-40 truncate text-[9px] uppercase tracking-[0.15em] text-black/50">
                {cafe.description}
              </small>
            </span>
          </a>
          <div className="flex items-center gap-2">
            <div
              className="hidden items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 sm:flex"
              aria-label="Language"
            >
              {locales.map((item) => (
                <button
                  className={`h-8 w-9 rounded-full text-[10px] font-bold uppercase transition ${locale === item ? "bg-[var(--brand)] text-white" : "text-black/45 hover:text-black"}`}
                  key={item}
                  type="button"
                  aria-pressed={locale === item}
                  onClick={() => setLocale(item)}
                >
                  {item === "uk" ? "UA" : item}
                </button>
              ))}
            </div>
            {locales.length > 1 ? <button
              className="grid size-10 place-items-center rounded-full border border-black/10 bg-white/70 sm:hidden"
              type="button"
              onClick={() =>
                setLocale(
                  locales[(locales.indexOf(locale) + 1) % locales.length],
                )
              }
              aria-label="Change language"
            >
              <span className="text-[10px] font-bold uppercase">
                {locale === "uk" ? "UA" : locale}
              </span>
            </button> : null}
          </div>
        </div>
      </header>

      <section
        id="menu"
        className="mx-auto max-w-6xl px-4 pb-14 pt-7 sm:px-6 sm:pb-20 sm:pt-12"
      >
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/8 bg-white/55 px-4 py-3 text-xs text-black/55">
          <span className="flex items-center gap-2">
            <MapPinIcon />
            {cafe.location}
          </span>
          <span className="flex items-center gap-2">
            <i
              className={`size-2 rounded-full ${isClosed ? "bg-red-500" : "bg-emerald-600 shadow-[0_0_0_4px_rgba(5,150,105,.1)]"}`}
            />
            {isClosed
              ? `${isClosedDay ? t.closed : t.closedNow} · ${cafe.openFrom.slice(0, 5)}–${cafe.openUntil.slice(0, 5)}`
              : `${t.open} ${cafe.openFrom.slice(0, 5)}–${cafe.openUntil.slice(0, 5)}`}
          </span>
        </div>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#896e4a]">
              {cafe.name} selection
            </p>
            <h1 className="mt-2 font-serif text-4xl tracking-[-.03em] sm:text-6xl">
              {t.menu}
            </h1>
          </div>
          <label className="flex h-12 items-center gap-3 rounded-full border border-black/10 bg-white px-4 shadow-sm sm:w-80">
            <SearchIcon />
            <span className="sr-only">{t.search}</span>
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/35"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.search}
              type="search"
            />
          </label>
        </div>

        <div className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <button
            className={`pressable shrink-0 rounded-full px-5 py-3 text-xs font-semibold ${category === "all" ? "scale-[1.03] bg-[var(--brand)] text-white shadow-lg" : "border border-black/10 bg-white"}`}
            type="button"
            onClick={() => setCategory("all")}
          >
            {t.all}
          </button>
          {categories.map((item) => (
            <button
              className={`pressable shrink-0 rounded-full px-5 py-3 text-xs font-semibold ${category === item.id ? "scale-[1.03] bg-[var(--brand)] text-white shadow-lg" : "border border-black/10 bg-white hover:border-black/25"}`}
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
            >
              {item.id === "popular" ? t.popularCategory : item.label[locale]}
            </button>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between border-b border-black/10 pb-4">
          <p className="text-xs text-black/45">
            {visibleItems.length} {countLabel}
          </p>
          {cafe.reviewCount > 0 ? <p className="flex items-center gap-1 text-xs font-semibold text-[#8b6b41]">
            ★ {cafe.rating}{" "}
            <span className="font-normal text-black/35">
              ({cafe.reviewCount})
            </span>
          </p> : null}
        </div>

        {visibleItems.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item, index) => (
              <article
                className="reveal-card group overflow-hidden rounded-[1.5rem] border border-black/8 bg-white shadow-[0_10px_35px_rgba(55,40,25,.05)]"
                style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
                key={`${category}-${locale}-${item.id}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#e7e0d5]">
                  <Image
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    src={item.image}
                    alt={item.name[locale]}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                  {item.badges ? (
                    <div className="absolute left-3 top-3 flex gap-1.5">
                      {item.badges.map((badge) => (
                        <span
                          className="rounded-full bg-white/90 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide text-[#1d352a] backdrop-blur"
                          key={badge}
                        >
                          {t[badge]}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-serif text-2xl leading-tight">
                      {item.name[locale]}
                    </h3>
                    <div className="shrink-0 text-right">
                      <strong className="text-sm">
                        {item.price} {cafe.currency}
                      </strong>
                      {item.oldPrice ? (
                        <del className="block text-[11px] text-black/35">
                          {item.oldPrice} {cafe.currency}
                        </del>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-black/48">
                    {item.description[locale]}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-serif text-3xl">{t.empty}</p>
            <p className="mt-2 text-sm text-black/45">{t.emptyText}</p>
          </div>
        )}
      </section>

      <footer className="border-t border-black/8 bg-[var(--brand)] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <strong className="font-serif text-xl tracking-[.15em]">
              {cafe.name}
            </strong>
            <p className="mt-2 text-xs text-white/60">{cafe.location}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/75">
              {cafe.phone ? (
                <a href={`tel:${cafe.phone}`}>{cafe.phone}</a>
              ) : null}
              {cafe.instagram ? (
                <a href={instagramUrl ?? undefined} rel="noreferrer" target="_blank">Instagram ↗</a>
              ) : null}
              {cafe.contactEmail ? <a href={`mailto:${cafe.contactEmail}`}>{cafe.contactEmail}</a> : null}
              {cafe.website ? (
                <a href={cafe.website} rel="noreferrer" target="_blank">
                  Сайт ↗
                </a>
              ) : null}
            </div>
          </div>
          <p className="text-xs text-white/70">{t.allergens}</p>
        </div>
      </footer>
    </main>
  );
}
