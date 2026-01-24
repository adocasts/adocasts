import BaseModelDto from '#dtos/base_model_dto'
import FrameworkVersion from '#models/framework_version'

export default class FrameworkVersionDto extends BaseModelDto {
  static model() {
    return FrameworkVersion
  }

  declare id: number
  declare framework: string
  declare version: string
  declare name: string
  declare slug: string
  declare sort: number | null
  declare meta: Record<string, any>

  constructor(frameworkVersion?: FrameworkVersion) {
    if (!frameworkVersion) return

    super()

    this.id = frameworkVersion.id
    this.framework = frameworkVersion.framework
    this.version = frameworkVersion.version
    this.name = frameworkVersion.name
    this.slug = frameworkVersion.slug
    this.sort = frameworkVersion.sort
    this.meta = frameworkVersion.$extras
  }
}
