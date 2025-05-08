enum PostTypes {
  LESSON = 1,
  BLOG = 2,
  LINK = 3,
  NEWS = 4,
  LIVESTREAM = 5,
  SNIPPET = 6,
}

export const PostTypeDesc: Record<PostTypes, string> = {
  [PostTypes.LESSON]: 'Lesson',
  [PostTypes.BLOG]: 'Blog Post',
  [PostTypes.LINK]: 'Link',
  [PostTypes.NEWS]: 'News',
  [PostTypes.LIVESTREAM]: 'Livestream',
  [PostTypes.SNIPPET]: 'Snippet',
}

export default PostTypes
