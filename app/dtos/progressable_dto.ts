import ProgressTypes from '#enums/progress_types'
import BaseModelDto from './base_model_dto.js'

export default abstract class ProgressableDto extends BaseModelDto {
  abstract id: number
  abstract progressType: ProgressTypes

  isProgressable = true
}
