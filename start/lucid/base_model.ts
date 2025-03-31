import CamelCaseNamingStrategy from '#core/strategies/camel_case_naming_strategy'
import { BaseModel } from '@adonisjs/lucid/orm'

BaseModel.namingStrategy = new CamelCaseNamingStrategy()
BaseModel.prototype.serializeExtras = true
