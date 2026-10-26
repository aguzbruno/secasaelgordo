import type { Metadata, Viewport } from "next";
import { Anton, Archivo, Big_Shoulders_Stencil } from "next/font/google";
import { AppProvider } from "@/components/AppProvider";
import { SwRegister } from "@/components/SwRegister";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const stencil = Big_Shoulders_Stencil({
  weight: ["800", "900"],
  subsets: ["latin"],
  variable: "--font-stencil",
});
const archivo = Archivo({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Se casa el Gordo",
  description: "Info, itinerario y gastos de la despedida de soltero del Gordo.",
  applicationName: "Despedida del Gordo",
  appleWebApp: { capable: true, title: "Se casa el Gordo", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f1ede4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${anton.variable} ${stencil.variable} ${archivo.variable}`}>
      <body>
        <AppProvider>{children}</AppProvider>
        <SwRegister />
      </body>
    </html>
  );
}
