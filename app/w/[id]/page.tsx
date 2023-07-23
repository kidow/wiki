import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Client } from '@notionhq/client'
import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import classnames from 'classnames'
import * as Block from 'components/Block'
import urlMetadata from 'url-metadata'
import {
  getChildBlocksWithChildrenRecursively,
  getRichTextClassName,
  isUUID
} from 'utils'

const notion = new Client({ auth: process.env.NOTION_SECRET_KEY })

export const revalidate = 60 * 60 * 24 * 7

export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  if (!isUUID(params.id)) notFound()
  try {
    const data = (await notion.pages.retrieve({
      page_id: params.id
    })) as unknown as WikiItem
    const TITLE = `${data.properties?.제목?.title[0]?.plain_text} | Kidow`
    const KEYWORDS = data.properties?.태그?.multi_select
      ?.map((item) => item.name)
      ?.join(', ')
    const BASE_URL = `https://wiki.kidow.me/w/${data.id}`
    return {
      title: TITLE,
      keywords: KEYWORDS,
      alternates: {
        canonical: BASE_URL
      },
      openGraph: {
        title: TITLE,
        type: 'article',
        publishedTime: data.created_time,
        authors: 'kidow',
        url: BASE_URL,
        tags: KEYWORDS
      },
      twitter: {
        title: TITLE,
        creator: '__kidow__',
        card: 'summary_large_image'
      },
      metadataBase: new URL(BASE_URL)
    }
  } catch (err) {
    notFound()
  }
}

async function* getList() {
  let isFirst = true
  let nextCursor: string

  while (isFirst || nextCursor) {
    const { results, next_cursor } = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      start_cursor: nextCursor
    })
    nextCursor = next_cursor
    if (isFirst) isFirst = false

    yield results
  }
}

export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  let results = []
  for await (const arr of getList()) {
    results.push(...arr)
  }
  return results
}

async function getPost(id: string) {
  if (!isUUID(id)) notFound()
  let isFirst = true
  let nextCursor: string
  let data: BlockObjectResponse[] = []

  while (isFirst || nextCursor) {
    try {
      const { results, next_cursor } = await notion.blocks.children.list({
        block_id: id,
        start_cursor: nextCursor
      })
      nextCursor = next_cursor
      if (isFirst) isFirst = false

      data.push(...(results as BlockObjectResponse[]))
    } catch (err) {
      notFound()
    }
  }

  return data
}

async function getData(id: string): Promise<WikiItem> {
  try {
    return (await notion.pages.retrieve({
      page_id: id
    })) as unknown as WikiItem
  } catch (err) {
    notFound()
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  if (!isUUID(params.id)) notFound()
  const [data, list] = await Promise.all([
    getData(params.id),
    getPost(params.id)
  ])

  const render = async () => {
    let items = []
    let orderedList = []
    let underedList = []
    for (const block of list) {
      if (block.type === 'numbered_list_item') {
        if (block.has_children) {
          const children = await getChildBlocksWithChildrenRecursively(block.id)
          orderedList.push(
            <Block.NumberedListItem key={block.id} {...block}>
              <ol>
                {children.map((item, key) => (
                  <li key={key}>
                    {item?.numbered_list_item?.rich_text?.map((child, i) => (
                      <span key={i}>{child.plain_text}</span>
                    ))}
                  </li>
                ))}
              </ol>
            </Block.NumberedListItem>
          )
        } else {
          orderedList.push(<Block.NumberedListItem {...block} />)
        }
      } else if (orderedList.length) {
        items.push(<ol key={'ol' + block.id}>{orderedList}</ol>)
        orderedList = []
      }
      if (block.type === 'bulleted_list_item') {
        if (block.has_children) {
          const children = await getChildBlocksWithChildrenRecursively(block.id)
          underedList.push(
            <Block.BulletedListItem key={block.id} {...block}>
              <ul>
                {children.map((item, key) => (
                  <li key={key}>
                    {item?.numbered_list_item?.rich_text?.map((child, i) => (
                      <span key={i}>{child.plain_text}</span>
                    ))}
                  </li>
                ))}
              </ul>
            </Block.BulletedListItem>
          )
        } else {
          underedList.push(<Block.BulletedListItem {...block} />)
        }
      } else if (underedList.length) {
        items.push(<ul key={'li' + block.id}>{underedList}</ul>)
        underedList = []
      }
      if (block.type === 'bookmark') {
        const metadata = (await urlMetadata(block.bookmark.url)) as Record<
          string,
          string
        >
        items.push(
          <Block.Bookmark {...block} key={block.id} metadata={metadata} />
        )
      }
      if (block.type === 'toggle') {
        if (block.has_children) {
          const children = await getChildBlocksWithChildrenRecursively(block.id)
          items.push(
            <Block.Toggle key={block.id} {...block}>
              <section className="ml-6 hidden cursor-text select-text group-focus:block">
                {children.map((child) => {
                  if (child.type === 'paragraph') {
                    return (
                      <p key={child.id}>
                        {child.paragraph.rich_text.map((item, key) => {
                          const className = getRichTextClassName(item)
                          if (item.href) {
                            return (
                              <Link
                                href={item.href}
                                target="_blank"
                                rel="noopenner noreferrer"
                                key={key}
                              >
                                <span className={classnames(className)}>
                                  {item.plain_text}
                                </span>
                              </Link>
                            )
                          }
                          return (
                            <span className={classnames(className)} key={key}>
                              {item.plain_text}
                            </span>
                          )
                        })}
                      </p>
                    )
                  }
                  return null
                })}
              </section>
            </Block.Toggle>
          )
        } else items.push(<Block.Toggle key={block.id} {...block} />)
      }
      if (block.type === 'paragraph')
        items.push(<Block.Paragraph key={block.id} {...block} />)
      if (block.type === 'to_do')
        items.push(<Block.Todo key={block.id} {...block} />)
      if (block.type === 'heading_1')
        items.push(<Block.Heading1 key={block.id} {...block} />)
      if (block.type === 'heading_2')
        items.push(<Block.Heading2 key={block.id} {...block} />)
      if (block.type === 'heading_3')
        items.push(<Block.Heading3 key={block.id} {...block} />)
      if (block.type === 'table')
        items.push(<Block.Table key={block.id} {...block} />)
      if (block.type === 'quote')
        items.push(<Block.Quote key={block.id} {...block} />)
      if (block.type === 'divider') items.push(<hr key={block.id} />)
      if (block.type === 'callout')
        items.push(<Block.Callout key={block.id} {...block} />)
      if (block.type === 'image')
        items.push(<Block.Image key={block.id} {...block} />)
      if (block.type === 'video')
        items.push(<Block.Video key={block.id} {...block} />)
      if (block.type === 'code')
        items.push(<Block.Code key={block.id} {...block} />)
    }
    return <>{items}</>
  }
  return (
    <article className="prose prose-slate mx-auto max-w-prose pb-40">
      <h1>{data.properties?.제목?.title[0]?.plain_text}</h1>
      {await render()}
    </article>
  )
}
