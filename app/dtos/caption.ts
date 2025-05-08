import BaseModelDto from '#dtos/base_model_dto'
import PostCaption from '#models/post_caption'

export default class CaptionDto extends BaseModelDto {
  static model() {
    return PostCaption
  }

  declare type: string
  declare label: string
  declare language: string
  declare filename: string
  declare sortOrder: number

  constructor(caption?: PostCaption) {
    super()

    if (!caption) return

    this.type = caption.type
    this.label = caption.label
    this.language = caption.language
    this.filename = caption.filename
    this.sortOrder = caption.sortOrder
  }
}
