export default class NumberService {
  static abbreviated(num: number) {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
    }

    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
    }

    if (num >= 1_000) {
      return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
    }

    return num.toLocaleString()
  }
}
