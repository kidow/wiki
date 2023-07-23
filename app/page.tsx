import Link from 'next/link'
import { Client } from '@notionhq/client'

import Pagination from './pagination'

export const dynamic = 'force-dynamic'

async function getData() {
  const notion = new Client({ auth: process.env.NOTION_SECRET_KEY })
  const data = (await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    sorts: [{ property: '생성일', direction: 'descending' }],
    ...(process.env.NODE_ENV === 'production'
      ? { filter: { property: '배포', checkbox: { equals: true } } }
      : {})
  })) as unknown as WikiList
  return data
}

export default async function Home() {
  const { results, next_cursor } = await getData()
  return (
    <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {results.map((item) => (
        <li key={item.id}>
          <Link href={`/w/${item.id}`}>
            <span className="font-semibold hover:underline">
              {item.properties?.제목?.title[0]?.plain_text}
            </span>
          </Link>
        </li>
      ))}
      <Pagination nextCursor={next_cursor} />
    </ul>
  )
}
