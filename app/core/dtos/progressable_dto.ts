import NotImplementedException from '#core/exceptions/not_implemented_exception'
import { ProgressContext } from '#core/middleware/context/_progress'
import ProgressTypes from '#progress/enums/progress_types'
import BaseModelDto from './base_model_dto.js'

export default abstract class ProgressableDto extends BaseModelDto {
  abstract id: number
  abstract progressType: ProgressTypes

  addToProgress(progress: ProgressContext) {
    switch (this.progressType) {
      case 'post':
        return progress.post.add(this.id)
      case 'collection':
        return progress.collection.add(this.id)
      default:
        throw new NotImplementedException(
          `ProgressableDto does not implement progress type: ${this.progressType}`
        )
    }
  }
}
