import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "餐廳一站式整合",
  description: "即時整合店家人流、等待時間、營業狀態與線上點餐入口。",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#2e417b",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-Hant" className="bg-background">
      <body
        className="font-sans antialiased"
        style={{
          fontFamily:
            '"Noto Sans TC", "Microsoft JhengHei", "PingFang TC", system-ui, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  )
}
