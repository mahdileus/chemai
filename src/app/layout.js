import "./globals.css";

export const metadata = {
  title: "کمای خرید بدون واسطه !" ,
  description: "خرید و فروش بدون واسطه",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa">
      <body>
        {children}
      </body>
    </html>
  );
}
