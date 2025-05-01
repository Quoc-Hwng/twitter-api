import { ObjectId } from 'mongodb'
import databaseConfig from '~/config/database.config'
import { FollowStatus, TweetAudience, TweetType } from '~/constants/enum'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { HashtagSchema } from '~/models/schemas/Hashtag.schema'
import { Tweet, TweetSchema } from '~/models/schemas/Tweet.schema'
import { TweetBodyType } from '~/schemaValidations/tweets.schema'
import { ForbiddenError, NotFoundError, UnprocessableEntityError } from '~/utils/errors'

class TweetsService {
  async checkAndCreateHashtag(hashtags: string[]) {
    const validHashtags = hashtags.map((name) => HashtagSchema.parse({ name }).name)
    const hashtagDocuments = await Promise.all(
      validHashtags.map((name) => {
        return databaseConfig.hashtags.findOneAndUpdate(
          { name }, // filter đơn giản
          { $setOnInsert: { name } },
          { upsert: true, returnDocument: 'after' }
        )
      })
    )
    return hashtagDocuments.map((doc) => doc?._id)
  }
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
    const hashtags = await this.checkAndCreateHashtag(data.hashtags)
    const newTweet = TweetSchema.parse({
      audience: data.audience,
      content: data.content,
      hashtags,
      mentions: data.mentions,
      medias: data.medias,
      parentId: data.parentId ? new ObjectId(data.parentId) : null,
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
      userId: tweet.userId.toString(),
      hashtags: tweet.hashtags.map((hashtag) => hashtag.toString())
    }
  }
  async getTweetDetail(currentUserId: string | null, tweetId: string) {
    const tweet = await databaseConfig.tweets.findOne({
      _id: new ObjectId(tweetId)
    })
    if (!tweet) {
      throw new NotFoundError('Tweet not found')
    }
    const author = await databaseConfig.users.findOne(
      { _id: tweet.userId },
      {
        projection: {
          isPrivate: 1,
          twitterCircle: 1
        }
      }
    )

    if (!author) {
      throw new NotFoundError('Author not found')
    }
    if (author.isPrivate) {
      if (!currentUserId) {
        throw new ForbiddenError('This account is private. Login to view.')
      }

      // Nếu user đã login, check xem có phải follower không
      const isFollowing = await databaseConfig.followers.findOne({
        followerId: new ObjectId(currentUserId),
        followingId: author._id,
        followStatus: FollowStatus.Following
      })

      if (!isFollowing) {
        throw new ForbiddenError('You must be a follower to view this private tweet.')
      }
    }
    const canReply = (async () => {
      if (tweet.audience === TweetAudience.Everyone) {
        return true
      }

      if (tweet.audience === TweetAudience.Followers) {
        if (!currentUserId) return false
        // Check current user có follow author không
        const isFollowing = await databaseConfig.followers.findOne({
          followerId: new ObjectId(currentUserId),
          followingId: author._id,
          followStatus: FollowStatus.Following
        })
        return !!isFollowing
      }

      if (tweet.audience === TweetAudience.TwitterCircle) {
        if (!currentUserId) return false
        // Check current user có trong whitelist không (tweet.replyWhitelist chứa list userId)
        return author?.twitterCircle?.some((id: ObjectId | undefined) => id && id.equals(new ObjectId(currentUserId)))
      }

      return false
    })()
    const [tweetDetail] = await databaseConfig.tweets
      .aggregate<Tweet>([
        {
          $match: {
            _id: new ObjectId(tweetId)
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  username: '$$mention.username',
                  email: '$$mention.email'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweetId',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parentId',
            as: 'tweetChildren'
          }
        },
        {
          $addFields: {
            bookmarks: { $size: '$bookmarks' },
            reTweetCount: {
              $size: {
                $filter: {
                  input: '$tweetChildren',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.Retweet] }
                }
              }
            },
            commentCount: {
              $size: {
                $filter: {
                  input: '$tweetChildren',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.Comment] }
                }
              }
            },
            quoteCount: {
              $size: {
                $filter: {
                  input: '$tweetChildren',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.QuoteTweet] }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_children: 0
          }
        }
      ])
      .toArray()

    if (!tweetDetail) {
      throw new NotFoundError('Tweet detail not found')
    }
    let isLikedByCurrentUser = false
    if (currentUserId) {
      const liked = await databaseConfig.likes.findOne({
        userId: new ObjectId(currentUserId),
        tweetId: tweet._id
      })
      isLikedByCurrentUser = Boolean(liked)
    }
    const CanReply = await canReply
    return {
      ...tweetDetail,
      canReply: CanReply ? { _id: tweetDetail._id?.toString() } : null,
      isLikedByCurrentUser
    }
  }
  async increaseView(tweetId: string) {
    await databaseConfig.tweets.updateOne({ _id: new ObjectId(tweetId) }, { $inc: { views: 1 } })
  }

  async getTweetChildren(
    currentUserId: string | null,
    tweetId: string,
    tweetType: TweetType,
    limit: number,
    page: number
  ) {
    // const skip = (page - 1) * limit
    const tweet = await databaseConfig.tweets.findOne({ _id: new ObjectId(tweetId) })
    if (!tweet) {
      throw new NotFoundError('Tweet not found')
    }
    const author = await databaseConfig.users.findOne(
      { _id: tweet.userId },
      {
        projection: {
          isPrivate: 1,
          twitterCircle: 1
        }
      }
    )
    if (!author) {
      throw new NotFoundError('Author not found')
    }
    if (author.isPrivate) {
      if (!currentUserId) {
        throw new ForbiddenError('This account is private. Login to view.')
      }

      // Nếu user đã login, check xem có phải follower không
      const isFollowing = await databaseConfig.followers.findOne({
        followerId: new ObjectId(currentUserId),
        followingId: author._id,
        followStatus: FollowStatus.Following
      })

      if (!isFollowing) {
        throw new ForbiddenError('You must be a follower to view this private tweet.')
      }
    }
    const tweets = await databaseConfig.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parentId: new ObjectId(tweetId),
            type: tweetType
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  username: '$$mention.username',
                  email: '$$mention.email'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweetId',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parentId',
            as: 'tweetChildren'
          }
        },
        {
          $addFields: {
            bookmarks: {
              $size: '$bookmarks'
            },
            reTweetCount: {
              $size: {
                $filter: {
                  input: '$tweetChildren',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Retweet]
                  }
                }
              }
            },
            commentCount: {
              $size: {
                $filter: {
                  input: '$tweetChildren',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Comment]
                  }
                }
              }
            },
            quoteCount: {
              $size: {
                $filter: {
                  input: '$tweetChildren',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.QuoteTweet]
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_children: 0
          }
        },
        {
          $skip: limit * (page - 1) // Công thức phân trang
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    const date = new Date()
    const [, total] = await Promise.all([
      databaseConfig.tweets.updateMany({ _id: { $in: ids } }, { $inc: { views: 1 } }),
      databaseConfig.tweets.countDocuments({
        parentId: new ObjectId(tweetId),
        type: tweetType
      })
    ])
    tweets.forEach((tweet) => {
      tweet.updatedAt = date
      tweet.views += 1
    })
    console.log(tweets)
    return {
      tweets,
      total
    }
  }
}

const tweetsService = new TweetsService()

export default tweetsService
