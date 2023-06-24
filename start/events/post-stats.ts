import Event from '@ioc:Adonis/Core/Event'
import Post from 'App/Models/Post'

Event.on('post:sync', async ({ post, views }: { post: Post, views: number }) => {
  if (post.viewCount && views <= post.viewCount) return
  await post.merge({ viewCount: views }).save()
})