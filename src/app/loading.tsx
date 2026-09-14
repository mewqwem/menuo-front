export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f4f0e8] p-4 sm:p-8" role="status" aria-label="Завантаження сторінки">
      <div className="mx-auto max-w-6xl">
        <div className="skeleton h-16 rounded-2xl" />
        <div className="skeleton mt-12 h-5 w-32 rounded-full" />
        <div className="skeleton mt-4 h-14 w-3/5 rounded-xl" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => <div className="skeleton h-64 rounded-3xl" key={item} />)}
        </div>
      </div>
      <span className="sr-only">Завантажуємо…</span>
    </main>
  );
}
