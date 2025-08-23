import CacheKeys from '#enums/cache_keys'
import CacheNamespaces from '#enums/cache_namespaces'
import PaywallTypes from '#enums/paywall_types'
import Post from '#models/post'
import cache from '@adonisjs/cache/services/main'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'

export default class CheckPosts extends BaseCommand {
  static commandName = 'check:posts'
  static description =
    'Check for newly published, recently updated, or delayed released posts and clear cache if needed'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Starting "CheckPosts"')

    const end = DateTime.now().toSQL()
    const endDelayed = DateTime.now().minus({ days: 14 }).toSQL()
    const start = DateTime.now().minus({ minutes: 5 }).toSQL()
    const startDelayed = DateTime.now().minus({ days: 14, minutes: 5 }).toSQL()

    const posts = await Post.query()
      .whereBetween('updatedAt', [start, end]) // updated in last 5 minutes
      .orWhereBetween('publishAt', [start, end]) // published in last 5 minutes
      .orWhere((query) => {
        // switched from plus access to free access in last 5 minutes
        query
          .where('paywallTypeId', PaywallTypes.DELAYED_RELEASE)
          .whereBetween('publishAt', [startDelayed, endDelayed])
      })

    // if no new posts, don't clear cache
    if (!posts.length) {
      this.logger.info('No new posts found')
      return
    } else {
      this.logger.info(`Found ${posts.length} new, updated, or delayed posts`)
    }

    // for now, let's just clear all content-based namespaces
    await cache.namespace(CacheNamespaces.POSTS).clear()
    await cache.namespace(CacheNamespaces.COLLECTIONS).clear()
    await cache.namespace(CacheNamespaces.TAXONOMIES).clear()
    await cache.delete({ key: CacheKeys.SITE_STATS })

    await cache.disconnect()

    this.logger.info(
      `Cleared cache namespaces: ${CacheNamespaces.POSTS}, ${CacheNamespaces.COLLECTIONS}, ${CacheNamespaces.TAXONOMIES}`
    )
  }
}
