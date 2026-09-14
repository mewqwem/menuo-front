import type { Locale, MenuData, MenuItem } from '@/components/menu-data';

type ApiItem = {
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
};

type ApiCategory = {
  id: string;
  name_uk: string;
  name_pl: string;
  name_en: string;
  items: ApiItem[];
};

type ApiMenu = {
  slug: string;
  name: string;
  description: string;
  address: string;
  currency: string;
  logo_url: string | null;
  primary_color: string;
  rating: string;
  review_count: number;
  open_until: string;
  open_from: string;
  closed_days: string[];
  phone: string | null;
  contact_email: string | null;
  instagram: string | null;
  website: string | null;
  enabled_locales: Locale[];
  default_locale: Locale;
  categories: ApiCategory[];
};

type ApiResponse = {
  data: ApiMenu;
};

function getBadges(item: ApiItem): MenuItem['badges'] {
  const badges: NonNullable<MenuItem['badges']> = [];
  if (item.isPopular) badges.push('popular');
  if (item.isNew) badges.push('new');
  if (item.isVegan) badges.push('vegan');
  return badges.length > 0 ? badges : undefined;
}

export async function getMenuBySlug(slug: string): Promise<MenuData> {
  const apiUrl = process.env.API_URL ?? 'http://localhost:4000';
  const response = await fetch(`${apiUrl}/api/menus/${slug}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Menu API returned ${response.status}`);
  }

  const { data } = await response.json() as ApiResponse;
  const menuItems = data.categories.flatMap((category) => category.items.map((item) => ({
    id: item.id,
    categoryId: category.id,
    name: { uk: item.nameUk, pl: item.namePl, en: item.nameEn },
    description: { uk: item.descriptionUk, pl: item.descriptionPl, en: item.descriptionEn },
    price: Number(item.price),
    oldPrice: item.oldPrice ? Number(item.oldPrice) : undefined,
    image: item.imageUrl,
    badges: getBadges(item),
  })));

  return {
    cafe: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      location: data.address,
      currency: data.currency === 'PLN' ? 'zł' : data.currency,
      primaryColor: data.primary_color,
      logoUrl: data.logo_url,
      rating: String(data.rating),
      reviewCount: data.review_count,
      openUntil: data.open_until,
      openFrom: data.open_from,
      closedDays: data.closed_days,
      phone: data.phone,
      contactEmail: data.contact_email,
      instagram: data.instagram,
      website: data.website,
      enabledLocales: data.enabled_locales,
      defaultLocale: data.default_locale,
    },
    categories: [
      { id: 'popular', label: { uk: 'Популярне', pl: 'Popularne', en: 'Popular' } },
      ...data.categories.map((category) => ({
        id: category.id,
        label: { uk: category.name_uk, pl: category.name_pl, en: category.name_en },
      })),
    ],
    menuItems,
  };
}
