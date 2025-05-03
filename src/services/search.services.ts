import databaseConfig from '~/config/database.config'
import { FollowStatus, PeopleFollow } from './../constants/enum'
import { ObjectId } from 'mongodb'
import { Tweet } from '~/models/schemas/Tweet.schema'
class SearchService {
  async searchUsers(q: string, page: number, limit: number, currentUserId: string, peopleFollow: PeopleFollow) {
    const skip = (page - 1) * limit
    const userIdObj = new ObjectId(currentUserId)

    // Build match trên users text index
    const match: any = { $text: { $search: q } }

    // Nếu filter = 'following', chỉ những user bạn follow
    if (peopleFollow === PeopleFollow.Following) {
      if (!currentUserId) {
        // chưa login thì kết quả rỗng
        return { hits: [], total: 0, page, limit }
      }
      // Lấy danh sách following của bạn
      const followings = await databaseConfig.followers
        .find({
          followerId: userIdObj,
          followStatus: FollowStatus.Following
        })
        .project({ followingId: 1, _id: 0 })
        .toArray()

      const followingIds = followings.map((f) => f.followingId)
      match._id = { $in: followingIds }
    }

    // Query users collection
    const [docs, total] = await Promise.all([
      databaseConfig.users
        .find(match, {
          projection: {
            score: { $meta: 'textScore' },
            password: 0,
            email: 0,
            verifyEmailToken: 0,
            forgotPasswordToken: 0,
            tweetCircle: 0
          }
        })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .toArray(),
      databaseConfig.users.countDocuments(match)
    ])

    // Gắn isFollowing flag
    const enriched = await Promise.all(
      docs.map(async (u) => {
        const isFollowing = currentUserId
          ? !!(await databaseConfig.followers.findOne({
              followerId: userIdObj,
              followingId: u._id,
              followStatus: FollowStatus.Following
            }))
          : false
        return {
          id: u._id.toHexString(),
          name: u.name,
          username: u.username,
          avatarUrl: u.avatar,
          bio: u.bio,
          isFollowing
        }
      })
    )
    return { hits: enriched, total, page, limit }
  }
  async searchTop(q: string, page: number, limit: number, currentUserId: string, peopleFollow: PeopleFollow) {
    const skip = (page - 1) * limit
    const userObjId = new ObjectId(currentUserId)

    // Bước 1: peopleFollow === Following, load tweet user follow
    let followingIds: ObjectId[] = []
    if (peopleFollow === PeopleFollow.Following && userObjId) {
      const docs = await databaseConfig.followers
        .find({
          followerId: userObjId,
          followStatus: FollowStatus.Following
        })
        .project({ followingId: 1, _id: 0 })
        .toArray()
      followingIds = docs.map((d) => d.followingId)
      //show cả tweet mình
      followingIds.push(userObjId)
    }

    // Bước 2: build aggregation pipeline
    const pipeline: any[] = [
      {
        // full-text search với text index
        $match: {
          $text: { $search: q },
          ...(peopleFollow === PeopleFollow.Following ? { userId: { $in: followingIds } } : {})
        }
      },
      {
        // thêm field textScore
        $addFields: {
          score: { $meta: 'textScore' },
          // engagement = like + retweet + reply
          engagement: {
            $add: ['$likeCount', '$reTweetCount', '$replyCount']
          }
        }
      },
      {
        // sort ưu tiên score, sau đó engagement, rồi createdAt
        $sort: { score: -1, engagement: -1, createdAt: -1 }
      },
      { $skip: skip },
      { $limit: limit },
      // lookup author để kiểm tra private/public
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      // lookup likes để check isLikedByCurrentUser
      {
        $lookup: {
          from: 'likes',
          let: { tweetId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$tweetId', '$$tweetId'] },
                    ...(userObjId ? [{ $eq: ['$userId', userObjId] }] : [{ $eq: [1, 0] }])
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: 'selfLike'
        }
      },
      {
        $addFields: {
          isLikedByCurrentUser: { $gt: [{ $size: '$selfLike' }, 0] }
        }
      },
      // lookup bookmarks
      {
        $lookup: {
          from: 'bookmarks',
          let: { tweetId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$tweetId', '$$tweetId'] },
                    ...(userObjId ? [{ $eq: ['$userId', userObjId] }] : [{ $eq: [1, 0] }])
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: 'selfBookmark'
        }
      },
      {
        $addFields: {
          isBookmarkedByCurrentUser: { $gt: [{ $size: '$selfBookmark' }, 0] }
        }
      },
      // tính canReply dựa replyPolicy và replyWhitelist trên tweet document
      {
        $addFields: {
          canReply: {
            $switch: {
              branches: [
                { case: { $eq: ['$replyPolicy', 0] }, then: true }, // Everyone
                {
                  // Followers
                  case: { $eq: ['$replyPolicy', 1] },
                  then: userObjId != null
                },
                {
                  // TwitterCircle
                  case: { $eq: ['$replyPolicy', 2] },
                  then: {
                    $in: [userObjId, '$replyWhitelist']
                  }
                }
              ],
              default: false
            }
          }
        }
      },
      // project chỉ các field cần thiết
      {
        $project: {
          score: 0,
          engagement: 0,
          selfLike: 0,
          selfBookmark: 0,
          'author.password': 0,
          'author.email': 0,
          'author.verifyEmailToken': 0,
          'author.forgotPasswordToken': 0,
          'author.tweetCircle': 0
        }
      }
    ]
    const [hits, totalRes] = await Promise.all([
      databaseConfig.tweets.aggregate<Tweet>(pipeline).toArray(),
      databaseConfig.tweets.countDocuments({ $text: { $search: q } })
    ])

    return {
      hits,
      total: totalRes,
      page,
      limit
    }
  }
  async searchMedia(q: string, page: number, limit: number, currentUserId: string, peopleFollow: PeopleFollow) {
    const skip = (page - 1) * limit
    const userObjId = new ObjectId(currentUserId)
    let followingIds: ObjectId[] = []
    if (peopleFollow === PeopleFollow.Following && userObjId) {
      const docs = await databaseConfig.followers
        .find({ followerId: userObjId, followStatus: FollowStatus.Following })
        .project({ followingId: 1, _id: 0 })
        .toArray()
      followingIds = docs.map((d) => d.followingId)
      followingIds.push(userObjId)
    }
    const pipeline: any[] = [
      {
        // Text search trên content và hashtags
        $match: {
          $text: { $search: q },
          media: { $exists: true, $ne: [] }, // chỉ tweet có media
          ...(peopleFollow === PeopleFollow.Following ? { userId: { $in: followingIds } } : {})
        }
      },
      {
        // Gắn điểm textScore để sort nếu cần
        $addFields: {
          score: { $meta: 'textScore' }
        }
      },
      {
        // Sort: ưu tiên textScore, sau đó createdAt mới nhất
        $sort: { score: -1, createdAt: -1 }
      },
      { $skip: skip },
      { $limit: limit },
      // Lấy thông tin author
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      // Check isLikedByCurrentUser
      {
        $lookup: {
          from: 'likes',
          let: { tid: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$tweetId', '$$tid'] },
                    ...(userObjId ? [{ $eq: ['$userId', userObjId] }] : [{ $eq: [1, 0] }])
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: 'selfLike'
        }
      },
      {
        $addFields: {
          isLikedByCurrentUser: { $gt: [{ $size: '$selfLike' }, 0] }
        }
      },
      // Check isBookmarkedByCurrentUser
      {
        $lookup: {
          from: 'bookmarks',
          let: { tid: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$tweetId', '$$tid'] },
                    ...(userObjId ? [{ $eq: ['$userId', userObjId] }] : [{ $eq: [1, 0] }])
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: 'selfBookmark'
        }
      },
      {
        $addFields: {
          isBookmarkedByCurrentUser: { $gt: [{ $size: '$selfBookmark' }, 0] }
        }
      },
      // Compute canReply same as in searchTop
      {
        $addFields: {
          canReply: {
            $switch: {
              branches: [
                { case: { $eq: ['$replyPolicy', 0] }, then: true },
                { case: { $eq: ['$replyPolicy', 1] }, then: !!userObjId },
                { case: { $eq: ['$replyPolicy', 2] }, then: { $in: [userObjId, '$replyWhitelist'] } }
              ],
              default: false
            }
          }
        }
      },
      // Loại bỏ helper fields và nhạy cảm
      {
        $project: {
          score: 0,
          selfLike: 0,
          selfBookmark: 0,
          'author.password': 0,
          'author.email': 0
        }
      }
    ]

    // Chạy aggregation và đếm tổng số kết quả
    const [hits, total] = await Promise.all([
      databaseConfig.tweets.aggregate<Tweet>(pipeline).toArray(),
      databaseConfig.tweets.countDocuments({
        $text: { $search: q },
        media: { $exists: true, $ne: [] },
        ...(peopleFollow === PeopleFollow.Following ? { userId: { $in: followingIds } } : {})
      })
    ])

    return { hits, total, page, limit }
  }
}

const searchService = new SearchService()
export default searchService
