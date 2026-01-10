import readingTime from 'reading-time'
import striptags from 'striptags'

const readingHelpers = {
  getReadCounts(body: string | null) {
    const cleanBody = striptags(body ?? '')
    const result = readingTime(cleanBody)

    return {
      minutes: Math.round(result.minutes),
      time: Math.round(result.time),
      words: Math.round(result.words),
    }
  },
}

export default readingHelpers
