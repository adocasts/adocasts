import Collection from '#collection/models/collection'
import BaseModelDto from '#core/dtos/base_model_dto'
import SeriesLessonDto from '#post/dtos/series_lesson'

export default class ModuleDto extends BaseModelDto {
  static selectExtras = ['sortOrder']

  static model() {
    return Collection
  }

  declare id: number
  declare name: string
  declare slug: string
  declare moduleNumber: number
  declare lessons: SeriesLessonDto[]

  constructor(module?: Collection) {
    super()

    if (!module) return

    this.id = module.id
    this.name = module.name
    this.slug = module.slug
    this.moduleNumber = module.moduleNumber
    this.lessons = SeriesLessonDto.fromArray(module.posts)
  }
}
