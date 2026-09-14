'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f3ed] px-5 text-center text-[#201a17]">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#1f392d] font-serif text-[#f5e8c8]">M</span>
        <h1 className="mt-6 font-serif text-4xl">Меню тимчасово недоступне</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/50">Не вдалося отримати дані ресторану. Перевірте підключення та спробуйте ще раз.</p>
        <button className="mt-7 rounded-full bg-[#1f392d] px-6 py-3 text-sm font-semibold text-white" type="button" onClick={reset}>Спробувати знову</button>
      </div>
    </main>
  );
}
