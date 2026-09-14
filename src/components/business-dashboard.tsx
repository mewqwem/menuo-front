"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  address: string;
  logo_url: string | null;
  primary_color: string;
  currency: string;
  item_count: number;
};

function positionLabel(count: number) {
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "позицій";
  if (count % 10 === 1) return "позиція";
  if ([2, 3, 4].includes(count % 10)) return "позиції";
  return "позицій";
}

export default function BusinessDashboard({ apiUrl }: { apiUrl: string }) {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadRestaurants() {
      try {
        const response = await fetch(`${apiUrl}/api/admin/restaurants`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        if (!response.ok) throw new Error("Не вдалося завантажити заклади");
        const result = await response.json();
        setRestaurants(result.data);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        )
          return;
        setError("Не вдалося зв’язатися із сервером. Спробуйте ще раз.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadRestaurants();
    return () => controller.abort();
  }, [apiUrl, router]);

  async function logout() {
    await fetch(`${apiUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
    router.refresh();
  }

  return (
    <main className="page-enter min-h-screen bg-[#f4f0e8] text-[#1d2b25]">
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link className="font-serif text-2xl font-bold" href="/">
            Menuo
          </Link>
          <button
            className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold"
            onClick={logout}
          >
            Вийти
          </button>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a36f38]">
              Ваш кабінет
            </p>
            <h1 className="mt-3 font-serif text-4xl sm:text-6xl">
              Мої заклади
            </h1>
            <p className="mt-3 text-sm text-black/50">
              Створюйте окреме QR-меню для кожної локації.
            </p>
          </div>
          <Link
            className="rounded-full bg-[#1f392d] px-6 py-3 text-center text-sm font-semibold text-white"
            href="/admin/new"
          >
            + Створити заклад
          </Link>
        </div>
        {loading ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div className="skeleton h-72 rounded-3xl" key={item} />
            ))}
          </div>
        ) : null}
        {error ? (
          <div
            className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-6"
            role="alert"
          >
            <p className="text-sm text-red-700">{error}</p>
            <button
              className="mt-4 rounded-full bg-[#1f392d] px-5 py-2 text-xs font-semibold text-white"
              type="button"
              onClick={() => window.location.reload()}
            >
              Спробувати ще раз
            </button>
          </div>
        ) : null}
        {!loading && !error && restaurants.length ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <article
                className="reveal-card rounded-3xl border border-black/10 bg-white p-6"
                key={restaurant.id}
              >
                <span
                  className="relative grid size-11 place-items-center overflow-hidden rounded-full text-white"
                  style={{ backgroundColor: restaurant.primary_color }}
                >
                  {restaurant.logo_url ? (
                    <Image
                      className="object-cover"
                      src={restaurant.logo_url}
                      alt={`Логотип ${restaurant.name}`}
                      fill
                      sizes="44px"
                      unoptimized
                    />
                  ) : (
                    restaurant.name.charAt(0).toUpperCase()
                  )}
                </span>
                <h2 className="mt-5 font-serif text-2xl">{restaurant.name}</h2>
                <p className="mt-2 text-sm text-black/45">
                  {restaurant.address}
                </p>
                <p className="mt-5 text-xs text-black/40">
                  {restaurant.item_count} {positionLabel(restaurant.item_count)}{" "}
                  · {restaurant.currency}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    className="rounded-full bg-[#1f392d] px-4 py-2 text-xs font-semibold text-white"
                    href={`/admin/${restaurant.slug}`}
                  >
                    Керувати
                  </Link>
                  <Link
                    className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold"
                    href={`/${restaurant.slug}`}
                  >
                    Переглянути
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}
        {!loading && !error && !restaurants.length ? (
          <div className="mt-10 rounded-3xl border border-dashed border-black/15 bg-white/60 p-10 text-center">
            <h2 className="font-serif text-2xl">Ще немає закладів</h2>
            <p className="mt-2 text-sm text-black/45">
              Створіть перший — це займе кілька хвилин.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
