export class ListService {
  static getRandom<T>(array: T[]) {
    return array[Math.floor(Math.random() * array.length)]
  }

  static pluckRandom<T>(array: T[], pluck: number) {
    const shuffle = array.sort(() => 0.5 - Math.random())
    return shuffle.slice(0, pluck)
  }
}
