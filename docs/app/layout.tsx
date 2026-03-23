import type { Metadata } from 'next'
import { Layout } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import themeConfig from '../theme.config'
import 'nextra-theme-docs/style.css'

export const metadata: Metadata = {
  title: 'AquaOS Docs',
  description: 'Documentation scaffold for AquaOS'
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pageMap = await getPageMap()

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>
        <Layout {...themeConfig} pageMap={pageMap}>
          {children}
        </Layout>
      </body>
    </html>
  )
}
