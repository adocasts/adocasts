import Testimonial from '#models/testimonial'
import AuthorDto from './author.js'
import BaseModelDto from './base_model_dto.js'

export default class TestimonialDto extends BaseModelDto {
  static model() {
    return Testimonial
  }

  declare id: number
  declare userId: number
  declare body: string
  declare createdAt: string
  declare approvedAt?: string | null
  declare rejectedAt?: string | null
  declare staleAt?: string | null
  declare author: AuthorDto | null
  declare meta: Record<string, any>

  constructor(row?: Testimonial) {
    super()

    if (!row) return

    this.id = row.id
    this.userId = row.userId
    this.body = row.body
    this.createdAt = row.createdAt.toISO()!
    this.approvedAt = row.approvedAt?.toISO()
    this.rejectedAt = row.rejectedAt?.toISO()
    this.staleAt = row.staleAt?.toISO()
    this.author = AuthorDto.fromModel(row.user)
    this.meta = row.$extras
  }
}
