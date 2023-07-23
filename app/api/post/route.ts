import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const cursor = url.searchParams.get('cursor')
  const notion = new Client({ auth: process.env.NOTION_SECRET_KEY })

  const data = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    sorts: [{ property: '생성일', direction: 'descending' }],
    start_cursor: cursor,
    ...(process.env.NODE_ENV === 'production'
      ? { filter: { property: '배포', checkbox: { equals: true } } }
      : {})
  })
  return NextResponse.json(data)
}
