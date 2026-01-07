import { type SimplePaginatorDtoMetaContract } from '@adocasts.com/dto/types'

export type PageItem = {
  type: 'page' | 'ellipsis'
  page?: number
  url?: string
  isActive?: boolean
}

export default class Pagination {
  pages: PageItem[] = []
  range: number = 1

  constructor(protected meta: SimplePaginatorDtoMetaContract) {
    this.add(this.meta.firstPage)

    if (this.meta.currentPage - this.range > this.meta.firstPage + 1) {
      this.pages.push({ type: 'ellipsis' })
    }

    // Show range of pages around currentPage
    const start = Math.max(this.meta.currentPage - this.range, this.meta.firstPage + 1)
    const end = Math.min(this.meta.currentPage + this.range, this.meta.lastPage - 1)

    for (let page = start; page <= end; page++) {
      this.add(page)
    }

    // Show right ellipsis if needed
    if (this.meta.currentPage + this.range < this.meta.lastPage - 1) {
      this.pages.push({ type: 'ellipsis' })
    }

    // Always show the last page
    if (this.meta.lastPage !== this.meta.firstPage) {
      this.add(this.meta.lastPage)
    }
  }

  add(page: number) {
    this.pages.push({
      page,
      type: 'page',
      url: this.findUrl(page),
      isActive: page === this.meta.currentPage,
    })
  }

  findUrl(page: number) {
    const item = this.meta.pagesInRange?.find((p) => p.page === page)
    return item?.url ?? `/lessons?page=${page}`
  }
}
