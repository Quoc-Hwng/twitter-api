import { ObjectId } from 'mongodb'
import databaseConfig from '~/config/database.config'
import { LIKE_MESSAGES } from '~/constants/messages'
import { LikeSchema } from '~/models/schemas/Like.schema'
import { ConflictError, NotFoundError } from '~/utils/errors'

class LikeService {
  async LikeTweet(userId: string, tweetId: string) {
    if (!(await databaseConfig.tweets.findOne({ _id: new ObjectId(tweetId) }))) {
      console.log(new ObjectId(tweetId))
      throw new NotFoundError('Tweet not found')
    }
    const newLike = LikeSchema.parse({
      userId: new ObjectId(userId),
      tweetId: new ObjectId(tweetId)
    })
    const existingLike = await databaseConfig.likes.findOne({
      userId: newLike.userId,
      tweetId: newLike.tweetId
    })

    if (existingLike) {
      throw new ConflictError('You already liked this tweet.')
    }
    const result = await databaseConfig.likes.insertOne(newLike)

    await databaseConfig.tweets.updateOne({ _id: newLike.tweetId }, { $inc: { likeCount: 1 } })
    return {
      _id: result.insertedId.toString()
    }
  }
  async unLikeTweet(userId: string, tweetId: string) {
    const newLike = LikeSchema.parse({
      userId: new ObjectId(userId),
      tweetId: new ObjectId(tweetId)
    })
    const existingLike = await databaseConfig.likes.findOne({
      userId: newLike.userId,
      tweetId: newLike.tweetId
    })

    if (!existingLike) {
      throw new NotFoundError('You have not liked this tweet yet.')
    }

    await databaseConfig.likes.deleteOne({
      userId: newLike.userId,
      tweetId: newLike.tweetId
    })

    await databaseConfig.tweets.updateOne({ _id: newLike.tweetId }, { $inc: { likeCount: -1 } })

    return LIKE_MESSAGES.UNLIKE_SUCCESSFULLY
  }
}

const likesService = new LikeService()
export default likesService
