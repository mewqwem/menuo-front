import MenuExperience from "@/components/menu-experience";
import { getMenuBySlug } from "@/lib/menu-api";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type MenuPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MenuPage({ params }: MenuPageProps) {
  const { slug } = await params;
  const menu = await getMenuBySlug(slug);
  if (!menu) notFound();

  return <MenuExperience data={menu} />;
}
