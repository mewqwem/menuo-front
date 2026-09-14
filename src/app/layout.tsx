import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Menuo — цифрове QR-меню для вашого закладу",
  description: "Створіть сучасне багатомовне QR-меню для кафе або ресторану.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
