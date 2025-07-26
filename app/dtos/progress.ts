import BaseModelDto from '#dtos/base_model_dto'
import Progress from '#models/progress'

export default class ProgressDto extends BaseModelDto {
  static model() {
    return Progress
  }

  declare id: number
  declare userId: number
  declare postId: number | null
  declare collectionId: number | null
  declare readPercent: number | null
  declare watchPercent: number | null
  declare watchSeconds: number
  declare isCompleted: boolean
  declare hasActivity: boolean
  declare percent: number

  declare completedLessons: number

  constructor(progress?: Progress) {
    super()

    if (!progress) return

    this.id = progress.id
    this.userId = progress.userId
    this.postId = progress.postId
    this.collectionId = progress.collectionId
    this.readPercent = progress.readPercent
    this.watchPercent = progress.watchPercent
    this.watchSeconds = progress.watchSeconds
    this.isCompleted = progress.isCompleted
    this.hasActivity = progress.hasActivity

    this.percent = progress.watchPercent || 0

    if (progress.isCompleted) {
      this.percent = 100
    }
  }
}
