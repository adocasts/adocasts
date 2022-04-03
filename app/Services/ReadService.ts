import striptags from 'striptags'
import readingTime from 'reading-time'
import Post from 'App/Models/Post'

interface IReadingTime {
  text: string,
  minutes: number,
  time: number,
  words: number
}

class ReadTime {
  public minutes: number
  public time: number
  public words: number

  constructor({ minutes, time, words }: IReadingTime) {
    this.minutes = Math.round(minutes)
    this.time = Math.round(time)
    this.words = Math.round(words)
  }
}

class ReadService {
  public static getReadCounts(body: string | null): ReadTime {
    const cleanBody = striptags(body ?? '')
    return new ReadTime(readingTime(cleanBody))
  }

  public static async confirmReadCount(post: Post): Promise<Post> {
    if (post.readMinutes || post.readTime || post.wordCount) return post

    const readTime = this.getReadCounts(post.body)

    post.readMinutes = readTime.minutes
    post.readTime = readTime.time
    post.wordCount = readTime.words

    await post.save()

    return post;
  }
}

export default ReadService;
