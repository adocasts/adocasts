/**
 * Copy of node-discord-service with superagent replaced with axios
 */

import axios from "axios";

/** Available colors for discord messages */
const COLORS: { [key: string]: number } = {
  /** Decimal for #db2828 */
  error: 14362664,

  /** Decimal for #fbbd08 */
  warn: 16497928,

  /** Decimal for #2185d0 */
  info: 2196944,

  /** Decimal for #6435c9 */
  verbose: 6559689,

  /** Decimal for #00ba4e */
  debug: 47694,

  /** Decimal for #f542dd */
  silly: 16073437
};

type LOG_LEVELS = 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly';

interface ErrorCallback {
  (err: Error): void;
}

interface LogMessage {
  /** Message content */
  message: string;
  /** Message description */
  description?: string;
  /** Error object if any */
  error?: Error;
  /** Additional JSON data for the message */
  json?: any;
  /** Additional meta data for the message */
  meta?: { [key: string]: string | number | Date };
}

export interface DiscordLoggerOptions {
  /** Discord Bot webhook */
  hook: string;
  /** An icon which will be displayed for all message in the footer */
  icon?: string;
  /** Service name which will be printed in the footer */
  serviceName?: string;
  /** Default meta to be sent with every request */
  defaultMeta?: { [key: string]: string | number | Date };
  /** Error callback to be called instead of logging errors to console */
  errorHandler?: { (err: Error): void };
}

export const hexCodeToDecimal = (str: string) => parseInt(str.replace(/^#/, ''), 16);

export default class DiscordLogger {
  /** Discord webhook */
  private hook: string;

  /** Default meta to be sent with every message */
  private defaultMeta?: { [key: string]: string | number | Date };

  /** Service icon url */
  private icon: string | undefined = undefined;

  /** Service name */
  private serviceName: string | undefined = undefined;

  /** Discord webhook id */
  private id: string | undefined = undefined;

  /** Discord webhook token */
  private token: string | undefined = undefined;

  /** Error callback provided to prevent console logging here */
  private onErrorCallback: ErrorCallback | undefined = undefined;

  /**
   * Create a discord logger instance
   * @param options Discord logger options
   */
  constructor(options: DiscordLoggerOptions) {
    this.hook = options.hook;
    this.icon = options.icon;
    this.serviceName = options.serviceName;
    this.defaultMeta = options.defaultMeta;
    this.onErrorCallback = options.errorHandler;
    this.getIdToken(); // Initialize `id` and `token` values
  }

  private logInternalError = (err: Error) => {
    if (this.onErrorCallback) {
      this.onErrorCallback(err);
    } else {
      console.error(err); // eslint-disable-line
    }
  };

  private getIdToken = async (): Promise<{ id: string; token: string }> => {
    if (!this.id || !this.token) {
      try {
        const { data } = await axios.get(this.hook)

        this.id = data.id;
        this.token = data.token;
      } catch (err) {
        this.logInternalError(err);
      }
    }
    return {
      id: this.id || '',
      token: this.token || ''
    };
  };

  private getUrl = async () => {
    const { id, token } = await this.getIdToken();
    return `https://discordapp.com/api/v6/webhooks/${id}/${token}`;
  };

  /**
   * Send a log message to discord
   * @param level Message log level
   * @param data Log message data
   */
  public log = async (
    level: LOG_LEVELS,
    data: LogMessage
  ) => {
    try {
      // https://birdie0.github.io/discord-webhooks-guide/discord_webhook.html
      const postBody = {
        content: undefined as string | undefined,
        embeds: [{
          title: data.message,
          description: data.description,
          color: COLORS[level],
          fields: [] as any[],
          timestamp: new Date().toISOString(),
          footer: {
            text: this.serviceName,
            icon_url: this.icon
          }
        }]
      };

      const contentStrings: string[] = [];

      if (data.json) {
        contentStrings.push(JSON.stringify(data.json, undefined, '  '));
      }

      if (data.error && data.error.stack) {
        contentStrings.push(data.error.stack);
      }

      if (contentStrings.length > 0) {
        postBody.content = `\`\`\`${contentStrings.join('\n\n')}\`\`\``;
      }

      if (data.meta) {
        Object.keys(data.meta).forEach(key => {
          postBody.embeds[0].fields.push({
            name: key,
            value: data.meta![key]
          });
        });
      }

      if (this.defaultMeta) {
        Object.keys(this.defaultMeta).forEach(key => {
          postBody.embeds[0].fields.push({
            name: key,
            value: this.defaultMeta![key],
            inline: true
          });
        });
      }

      const options = {
        url: await this.getUrl(),
        body: postBody
      };
      
      await axios.post(options.url, options.body)
    } catch (err) {
      this.logInternalError(err);
    }
  };

  /**
   * Send an error log message to discord
   * @param data Log message data
   */
  public error = async (data: LogMessage) => this.log('error', data);

  /**
   * Send a warning log message to discord
   * @param data Log message data
   */
  public warn = async (data: LogMessage) => this.log('warn', data);

  /**
   * Send an info log message to discord
   * @param data Log message data
   */
  public info = async (data: LogMessage) => this.log('info', data);

  /**
   * Send a verbose log message to discord
   * @param data Log message data
   */
  public verbose = async (data: LogMessage) => this.log('verbose', data);

  /**
   * Send a debug log message to discord
   * @param data Log message data
   */
  public debug = async (data: LogMessage) => this.log('debug', data);

  /**
   * Send a silly log message to discord
   * @param data Log message data
   */
  public silly = async (data: LogMessage) => this.log('silly', data);
}