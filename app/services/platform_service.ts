import platform from 'platform'

class VorPlatform {
  browser: string | undefined;
  browserVersion: string | undefined;
  os: string;
  // layout: string | undefined;
  // description: string | undefined;

  constructor(info: typeof platform) {
    this.browser = info.name;
    this.browserVersion = info.version;
    this.os = `${info.os?.family} ${info.os?.version}`.trim();
    // this.layout = info.layout;
    // this.description = info.description;
  }
}

export default class PlatformService {
  public static parse(agent: string): VorPlatform {
    const info = platform.parse(agent)
    return new VorPlatform(info);
  }
}