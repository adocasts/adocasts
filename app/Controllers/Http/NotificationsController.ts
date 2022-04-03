import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotAllowedException from 'App/Exceptions/NotAllowedException';
import NotificationService from 'App/Services/NotificationService';
import { schema as Schema } from '@ioc:Adonis/Core/Validator';

export default class NotificationsController {
  public async read({ request, response, auth }: HttpContextContract) {
    if (!auth.user) {
      throw new NotAllowedException("You must be logged in to alter notifications");
    }

    const schema = Schema.create({
      ids: Schema.array().members(Schema.number())
    });

    const { ids } = await request.validate({ schema });

    if (ids && ids.length) {
      for (let i = 0; i < ids.length; i++) {
        await NotificationService.onRead(ids[i]);
      }
    }

    const unreadNotifications = await NotificationService.getUnread(auth.user.id);
    const readNotifications = await NotificationService.getLatestRead(auth.user.id);

    return response.json({
      unreadNotifications,
      readNotifications
    });
  }
}
