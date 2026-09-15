import AdminPageLoader from '@/components/admin-page-loader';

type AdminPageProps = { params: Promise<{ slug: string }> };

export default async function AdminPage({ params }: AdminPageProps) {
  const { slug } = await params;
  return <AdminPageLoader apiUrl="" slug={slug} />;
}
