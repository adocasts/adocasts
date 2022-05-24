export default class AffiliateService {
  public static affiliates = [{
    href: 'https://200995oeov2n3kc3tzw9lbnyey.hop.clickbank.net',
    leaderboard: 'affiliates/diy-graphic-assets/diy-graphic-assets-728x90.png',
    square: 'affiliates/diy-graphic-assets/diy-graphic-assets-336x280.png',
    tall: 'affiliates/diy-graphic-assets/diy-graphic-assets-160x600.png',
    altText: 'DIY Graphic Design Assets promo image'
  }, {
    href: 'https://cb4201hgi9yq4sa70a5228px2i.hop.clickbank.net',
    leaderboard: 'affiliates/keyword-researcher/keyword-researcher-leader.jpg',
    square: 'affiliates/keyword-researcher/keyword-researcher-square.jpg',
    // tall: 'affiliates/keyword-researcher/',
    altText: 'Long tail keyword researcher promo image'
  }]

  public static getRandom() {
    const index = this.getRandomInt()
    return this.affiliates[index]
  }

  private static getRandomInt(max: number = this.affiliates.length) {
    return Math.floor(Math.random() * max)
  }
}