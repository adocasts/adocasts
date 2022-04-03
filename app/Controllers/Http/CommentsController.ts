import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Comment from 'App/Models/Comment'
import States from 'App/Enums/States'
import { inject } from '@adonisjs/core/build/standalone'
import HttpIdentityService from 'App/Services/Http/HttpIdentityService'
import CommentService from 'App/Services/CommentService'
import NotificationService from 'App/Services/NotificationService'

@inject()
export default class CommentsController {
  constructor(public httpIdentityService: HttpIdentityService) {}

  public async store({ request, response, auth }: HttpContextContract) {
    const identity = await this.httpIdentityService.getRequestIdentity()

    await CommentService.store(auth.user, identity, request.body())

    return response.redirect().back()
  }

  public async update({ request, response, auth, params, bouncer }: HttpContextContract) {
    const data = request.only(['body'])
    const identity = await this.httpIdentityService.getRequestIdentity()
    const comment = await auth.user!.related('comments').query().where('id', params.id).firstOrFail()

    await bouncer.with('CommentPolicy').authorize('update', comment, identity)
    await comment.merge(data).save()
    await NotificationService.onUpdate(Comment.table, comment.id, comment.body)

    return response.redirect().back()
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    const id = params.id
    const identity = await this.httpIdentityService.getRequestIdentity()
    const comment = await Comment.findOrFail(id)
    const parent = await comment.related('parent').query().first()
    const [children] = await comment.related('responses').query().whereNot('stateId', States.ARCHIVED).count('id')

    await bouncer.with('CommentPolicy').authorize('delete', comment, identity)

    if (Number(children.$extras.count)) {
      comment.merge({
        body: '[deleted]',
        stateId: States.ARCHIVED
      })

      await comment.save()
    } else {
      await comment.delete()
      await NotificationService.onDelete(Comment.table, comment.id)
    }

    if (parent?.stateId === States.ARCHIVED) {
      const [siblings] = await parent.related('responses').query().count('id')

      if (!Number(siblings.$extras.count)) {
        await parent.delete()
        await NotificationService.onDelete(Comment.table, parent.id)
      }
    }

    return response.redirect().back()
  }
}
