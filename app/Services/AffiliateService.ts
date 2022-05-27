export default class AffiliateService {
  public static affiliates = [
    Affiliate('interserver'),
    Affiliate('interserver2'),
    Affiliate('atlasvpn'),
    Affiliate('atlasvpn2'),
    Affiliate('adagio'),
    Affiliate('adagioKettle'),
    Affiliate('adagioPumpkinSpice'),
  ]

  public static getRandom() {
    const index = this.getRandomInt()
    return this.affiliates[index]
  }

  private static getRandomInt(max: number = this.affiliates.length) {
    return Math.floor(Math.random() * max)
  }
}

function Affiliate(name, ads: { [x: string]: string } = { tall: 'tall', square: 'square', leaderboard: 'leaderboard' }) {
  return { name, ...ads }
}