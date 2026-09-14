export type Locale = "uk" | "pl" | "en";

export type LocalizedText = Record<Locale, string>;

export type MenuItem = {
  id: number;
  categoryId: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  image: string;
  badges?: Array<"popular" | "new" | "vegan">;
  oldPrice?: number;
};

export type MenuCategory = {
  id: string;
  label: LocalizedText;
};

export type MenuData = {
  cafe: {
    slug: string;
    name: string;
    description: string;
    location: string;
    currency: string;
    primaryColor: string;
    logoUrl: string | null;
    rating: string;
    reviewCount: number;
    openUntil: string;
    openFrom: string;
    closedDays: string[];
    phone: string | null;
    contactEmail: string | null;
    instagram: string | null;
    website: string | null;
    enabledLocales: Locale[];
    defaultLocale: Locale;
  };
  categories: MenuCategory[];
  menuItems: MenuItem[];
};

export const dictionary = {
  uk: {
    open: "Працюємо",
    closed: "Сьогодні вихідний",
    closedNow: "Зараз зачинено",
    search: "Знайти у меню",
    menu: "Наше меню",
    all: "Усе",
    found: "позицій",
    currency: "zł",
    popular: "Хіт",
    popularCategory: "Популярне",
    new: "Новинка",
    vegan: "Vegan",
    empty: "Нічого не знайдено",
    emptyText: "Спробуй змінити пошук або категорію.",
    allergens: "Запитай про алергени у бариста",
  },
  pl: {
    open: "Otwarte",
    closed: "Dzisiaj zamknięte",
    closedNow: "Teraz zamknięte",
    search: "Szukaj w menu",
    menu: "Nasze menu",
    all: "Wszystko",
    found: "pozycji",
    currency: "zł",
    popular: "Hit",
    popularCategory: "Popularne",
    new: "Nowość",
    vegan: "Vegan",
    empty: "Nic nie znaleziono",
    emptyText: "Zmień wyszukiwanie lub kategorię.",
    allergens: "Zapytaj baristę o alergeny",
  },
  en: {
    open: "Open",
    closed: "Closed today",
    closedNow: "Closed now",
    search: "Search the menu",
    menu: "Our menu",
    all: "All",
    found: "items",
    currency: "zł",
    popular: "Popular",
    popularCategory: "Popular",
    new: "New",
    vegan: "Vegan",
    empty: "Nothing found",
    emptyText: "Try another search or category.",
    allergens: "Ask your barista about allergens",
  },
} as const;
