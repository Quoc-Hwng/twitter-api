import { ObjectId } from 'mongodb'
import databaseConfig from '~/config/database.config'
import { TweetType } from '~/constants/enum'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TweetSchema } from '~/models/schemas/Tweet.schema'
import { TweetBodyType } from '~/schemaValidations/tweets.schema'
import { NotFoundError, UnprocessableEntityError } from '~/utils/errors'

class TweetsService {
  async createTweetService(data: TweetBodyType, userId: string) {
    if (
      [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(data.type) &&
      (!data.parentId || !ObjectId.isValid(data.parentId))
    ) {
      throw new UnprocessableEntityError(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
    }

    if (data.type === TweetType.Tweet && data.parentId !== null) {
      throw new UnprocessableEntityError(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
    }

    if (
      [TweetType.Tweet, TweetType.Comment, TweetType.QuoteTweet].includes(data.type) &&
      data.content.trim() === '' &&
      data.hashtags.length === 0 &&
      data.mentions.length === 0
    ) {
      throw new UnprocessableEntityError(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
    }

    if (data.type === TweetType.Retweet && data.content.trim() !== '') {
      throw new UnprocessableEntityError(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
    }
    const newTweet = TweetSchema.parse({
      audience: data.audience,
      content: data.content,
      hashtags: [],
      mentions: data.mentions,
      medias: data.medias,
      parentId: data.parentId,
      type: data.type,
      userId: new ObjectId(userId)
    })
    const result = await databaseConfig.tweets.insertOne(newTweet)
    const tweet = await databaseConfig.tweets.findOne({ _id: result.insertedId })
    if (!tweet) {
      throw new NotFoundError('Something went wrong')
    }
    return {
      ...tweet,
      _id: tweet._id.toString(),
      userId: tweet.userId.toString()
    }
  }
}

const tweetsService = new TweetsService()

export default tweetsService
