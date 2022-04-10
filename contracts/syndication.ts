type Frequency = 'daily' | 'weekly' | 'monthly';

interface SiteMapItem {
  url: string,
  changefreq: Frequency,
  priority: number
}
