import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/navigation/Header";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Vance Practice Assistant | Solo Doctor Clinic Platform",
  description: "A calm, reliable clinic management assistant for Dr. Elena Vance and her patients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans antialiased">
        <ToastProvider>
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
          <footer className="w-full border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>© {new Date().getFullYear()} Vance Medical Practice • Internal Medicine & Wellness</p>
              <p className="text-slate-400">Doctor Portal • Reception Desk • Patient Portal • Public Site</p>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}

