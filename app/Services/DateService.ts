import { DateTime } from "luxon";

export default class DateService {
	/**
	 * Returns the joined Date and Time for PublishAt as Luxon DateTime
	 * @param {DateTime | undefined} publishAtDate [description]
	 * @param {DateTime | undefined} publishAtTime [description]
	 */
	public static getPublishAtDateTime(publishAtDate: DateTime | undefined, publishAtTime: DateTime | undefined) {
		let publishAt = DateTime.now()

    if (publishAtDate) {
      publishAt = publishAt.set({ year: publishAtDate.year, month: publishAtDate.month, day: publishAtDate.day })
    }

    if (publishAtTime) {
      publishAt = publishAt.set({ hour: publishAtTime.hour, minute: publishAtTime.minute })
    }

    return publishAt
	}
}