import Post from '#post/models/post'
import BaseLessonDto from '#post/dtos/base_lesson'

export default class SeriesLesson extends BaseLessonDto {
  declare lessonIndexDisplay: string
  declare rootIndexDisplay: string

  constructor(post?: Post) {
    super(post)

    if (!post) return

    this.lessonIndexDisplay = post.lessonIndexDisplay
    this.rootIndexDisplay = post.rootIndexDisplay
  }
}
