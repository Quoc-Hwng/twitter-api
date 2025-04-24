export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum FollowStatus {
  Following,
  Requested,
  Blocked
}

export enum MediaType {
  Image,
  Video,
  HLS
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum TweetAudience {
  Everyone,
  Followers,
  TwitterCircle
}
