import Link from 'next/link'

import './globals.css'

import { Inter } from 'next/font/google'
import { GithubIcon, HomeIcon } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Wiki | Kidow',
  description:
    '개발에 관한 지식들을 머릿속에 저장하기 위해 직접 정리하는 공간입니다.'
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <main className="container mx-auto">
          <div className="px-4 md:px-0">
            <header className="my-8">
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold">
                  <Link href="/">
                    <span>Wiki</span>
                  </Link>
                </h1>
                <form>
                  <input placeholder="검색..." />
                </form>
                <div className="flex items-center gap-2">
                  <Link href="https://kidow.me" target="_blank">
                    <HomeIcon size={20} />
                  </Link>
                  <Link href="https://github.com/kidow/wiki" target="_blank">
                    <GithubIcon size={20} />
                  </Link>
                </div>
              </div>
            </header>
            <hr className="my-8" />
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
