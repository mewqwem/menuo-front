import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f3ed] px-5 text-center text-[#201a17]">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#1f392d] font-serif text-[#f5e8c8]">M</span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-[#a36f38]">Помилка 404</p>
        <h1 className="mt-3 font-serif text-4xl">Такого меню не існує</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/50">Перевірте адресу або попросіть заклад надіслати актуальний QR-код.</p>
        <Link className="mt-7 inline-block rounded-full bg-[#1f392d] px-6 py-3 text-sm font-semibold text-white" href="/">На головну</Link>
      </div>
    </main>
  );
}
