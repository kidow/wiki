'use client'

import Script from 'next/script'

export default function Page(): JSX.Element {
  return (
    <main className="p-8">
      <blockquote className="voat" lang="ko" id="m5t6w8mw4d"></blockquote>
      <Script async defer src="https://voat.in/embed.js"></Script>
    </main>
  )
}
