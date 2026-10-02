import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CHRONO",
    template: "%s · CHRONO",
  },
  description:
    "CHRONO is a desktop browser puzzle game about rewinding time inside a failing temporal research facility.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
