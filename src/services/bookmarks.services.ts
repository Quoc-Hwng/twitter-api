import { ObjectId, WithId } from 'mongodb'
import databaseConfig from '~/config/database.config'
import { BookmarkSchema } from '~/models/schemas/Bookmark.schema'
import { NotFoundError } from '~/utils/errors'

class BookmarkService {
  async bookmarkTweet(userId: string, tweetId: string) {
    if (!(await databaseConfig.tweets.findOne({ _id: new ObjectId(tweetId) }))) {
      console.log(new ObjectId(tweetId))
      throw new NotFoundError('Tweet not found')
    }
    const newBookmark = BookmarkSchema.parse({
      userId: new ObjectId(userId),
      tweetId: new ObjectId(tweetId)
    })
    const result = await databaseConfig.bookmarks.findOneAndUpdate(
      newBookmark,
      { $setOnInsert: newBookmark },
      { upsert: true, returnDocument: 'after' }
    )
    return {
      _id: result?._id.toString()
    }
  }
}

const bookmarksService = new BookmarkService()
export default bookmarksService
