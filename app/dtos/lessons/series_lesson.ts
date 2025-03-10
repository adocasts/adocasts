import Post from '#models/post'
import BaseLessonDto from './base_lesson.js'

export default class SeriesLesson extends BaseLessonDto {
  declare lessonIndexDisplay: string

  constructor(post?: Post) {
    super(post)

    if (!post) return

    this.lessonIndexDisplay = post.lessonIndexDisplay
  }
}
