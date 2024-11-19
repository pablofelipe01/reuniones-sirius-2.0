import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SIRIUS IA",
  description: "Asistente de Reunion con IA",
  icons: {
    icon: "/favicon.ico", // Favicon for browsers
    apple: "/apple-touch-icon.png", // Icon for iOS devices
  },
};

// New export for viewport configuration
export const generateViewport = () => ({
  width: "device-width",
  initialScale: 1,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
