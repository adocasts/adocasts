import BaseAction from '#actions/base_action'
import Notification from '#models/notification'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class DestroyNotification extends BaseAction<
  [string, number, TransactionClientContract | undefined]
> {
  async handle(table: string, tableId: number, trx?: TransactionClientContract) {
    return Notification.query({ client: trx }).where({ table, tableId }).delete()
  }
}
