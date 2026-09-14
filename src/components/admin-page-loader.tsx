'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from './admin-dashboard';
import type { AdminMenu } from './admin-dashboard';

export default function AdminPageLoader({ apiUrl, slug }: { apiUrl: string; slug: string }) {
  const router = useRouter();
  const [data, setData] = useState<{ menu: AdminMenu; qrCode: string; menuUrl: string } | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([
      fetch(`${apiUrl}/api/admin/restaurants/${slug}`, { credentials: 'include' }),
      fetch(`${apiUrl}/api/admin/restaurants/${slug}/qr`, { credentials: 'include' }),
    ]).then(async ([menuResponse, qrResponse]) => {
      if (menuResponse.status === 401 || qrResponse.status === 401) { router.replace('/login'); return; }
      if (menuResponse.status === 404 || qrResponse.status === 404) { router.replace('/dashboard'); return; }
      if (!menuResponse.ok || !qrResponse.ok) throw new Error('Адмінка тимчасово недоступна');
      const [menuResult, qrResult] = await Promise.all([menuResponse.json(), qrResponse.json()]);
      setData({ menu: menuResult.data, qrCode: qrResult.data.qrCode, menuUrl: qrResult.data.menuUrl });
    }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Сталася помилка'));
  }, [apiUrl, router, slug]);
  if (error) return <main className="grid min-h-screen place-items-center bg-[#f4f0e8] p-6 text-center"><div><h1 className="font-serif text-3xl">Не вдалося відкрити адмінку</h1><p className="mt-3 text-sm text-black/50">{error}</p></div></main>;
  if (!data) return <main className="min-h-screen bg-[#f4f0e8] p-4 sm:p-8" role="status" aria-label="Завантажуємо кабінет"><div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[220px_1fr]"><div className="skeleton hidden h-52 rounded-2xl md:block" /><div><div className="skeleton h-5 w-32 rounded-full"/><div className="skeleton mt-4 h-12 w-3/5 rounded-xl"/><div className="mt-9 grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((item) => <div className="skeleton h-32 rounded-3xl" key={item}/>)}</div><div className="skeleton mt-6 h-72 rounded-3xl"/></div></div><span className="sr-only">Завантажуємо кабінет…</span></main>;
  return <AdminDashboard apiUrl={apiUrl} slug={slug} initialMenu={data.menu} qrCode={data.qrCode} menuUrl={data.menuUrl} />;
}
