interface WikiList {
  object: 'list'
  results: WikiItem[]
  next_cursor?: string
}

interface WikiItem {
  id: string
  created_time: string
  properties: {
    제목: {
      title: Array<{ plain_text: string }>
    }
    태그: {
      multi_select: Array<{ name: string }>
    }
    배포: {
      checkbox: boolean
    }
    생성일: {
      created_time: string
    }
  }
}

interface ReactProps {
  children?: ReactNode
}
