import BaseModelDto from '#core/dtos/base_model_dto'
import PostChapter from '#post/models/post_chapter'

export default class ChapterDto extends BaseModelDto {
  static model() {
    return PostChapter
  }

  declare start: string
  declare end: string
  declare text: string
  declare sortOrder: number

  constructor(chapter?: PostChapter) {
    super()

    if (!chapter) return

    this.start = chapter.start
    this.end = chapter.end
    this.text = chapter.text
    this.sortOrder = chapter.sortOrder
  }
}
