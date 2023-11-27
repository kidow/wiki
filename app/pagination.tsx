'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import Spinner from 'components/Spinner'

interface Props {
  nextCursor: string
}

export default function Pagination(props: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [list, setList] = useState<WikiItem[]>([])
  const [nextCursor, setNextCursor] = useState(props.nextCursor)

  const get = useCallback(async () => {
    if (isLoading) return
    setIsLoading(true)
    const res = await fetch(`/api/post?cursor=${nextCursor}`)
    const data = await res.json()
    setIsLoading(false)
    setList([...list, ...data.results])
    setNextCursor(data.next_cursor)
  }, [isLoading, list, nextCursor])
  return (
    <>
      {list.map((item) => (
        <li key={item.id}>
          <Link href={`/w/${item.id}`}>
            <span className="font-semibold hover:underline">
              {item.properties?.제목?.title[0]?.plain_text}
            </span>
          </Link>
        </li>
      ))}
      {!!nextCursor && (
        <li>
          {isLoading ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <button onClick={get} disabled={isLoading}>
              더 보기
            </button>
          )}
        </li>
      )}
    </>
  )
}
