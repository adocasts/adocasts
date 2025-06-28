import BaseModelDto from '#dtos/base_model_dto'
import PostChapter from '#models/post_chapter'

export default class ChapterDto extends BaseModelDto {
  static selectExtras = ['start', 'end']

  static model() {
    return PostChapter
  }

  declare startSeconds: number
  declare endSeconds: number
  declare text: string
  declare sortOrder: number

  constructor(chapter?: PostChapter) {
    super()

    if (!chapter) return

    this.startSeconds = chapter.startSeconds
    this.endSeconds = chapter.endSeconds
    this.text = chapter.text
    this.sortOrder = chapter.sortOrder
  }
}
