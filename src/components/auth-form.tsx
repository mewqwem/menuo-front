'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function AuthForm({ apiUrl, mode }: { apiUrl: string; mode: 'login' | 'register' }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isRegister = mode === 'register';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = await fetch(`${apiUrl}/api/auth/${mode}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Не вдалося продовжити');
      router.push('/dashboard'); router.refresh();
    } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : 'Сталася помилка'); setSaving(false); }
  }

  return <main className="grid min-h-screen place-items-center bg-[#f4f0e8] px-4 py-12 text-[#1c2924]"><div className="w-full max-w-md"><Link className="text-sm font-semibold" href="/">← Menuo</Link><div className="mt-8 rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_24px_80px_rgba(31,57,45,.10)] sm:p-9"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#a36f38]">Особистий кабінет</p><h1 className="mt-3 font-serif text-4xl">{isRegister ? 'Створити акаунт' : 'З поверненням'}</h1><p className="mt-3 text-sm leading-6 text-black/50">{isRegister ? 'Зареєструйтесь, щоб створювати й безпечно керувати своїми меню.' : 'Увійдіть, щоб продовжити роботу зі своїми закладами.'}</p><form className="mt-7 grid gap-4" onSubmit={submit}>{isRegister ? <label className="grid gap-2 text-xs font-semibold">Ваше ім’я<input className="h-12 rounded-xl border border-black/15 px-4 text-sm font-normal" minLength={2} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></label> : null}<label className="grid gap-2 text-xs font-semibold">Email<input className="h-12 rounded-xl border border-black/15 px-4 text-sm font-normal" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/></label><label className="grid gap-2 text-xs font-semibold">Пароль<input className="h-12 rounded-xl border border-black/15 px-4 text-sm font-normal" minLength={8} required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/><span className="font-normal text-black/35">Щонайменше 8 символів</span></label>{error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}<button className="mt-2 rounded-full bg-[#1f392d] px-6 py-4 text-sm font-semibold text-white disabled:opacity-50" disabled={saving}>{saving ? 'Зачекайте…' : isRegister ? 'Зареєструватися' : 'Увійти'}</button></form><p className="mt-6 text-center text-sm text-black/45">{isRegister ? 'Вже є акаунт?' : 'Ще немає акаунта?'} <Link className="font-semibold text-[#1f392d] underline" href={isRegister ? '/login' : '/register'}>{isRegister ? 'Увійти' : 'Реєстрація'}</Link></p></div></div></main>;
}
