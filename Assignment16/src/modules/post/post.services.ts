import { Types } from "mongoose";
import { createPostData } from "./post.validation.js";
import { PostModel } from "./post.model.js";
import { HUser } from "../user/types/user.types.js";
import { FriendRequestModel } from "../user/models/friendRequest.models.js";
import { FriendRequestEnum } from "../user/types/friendRequest.types.js";
import { PostPrivacyEnum } from "./post.types.js";
import { listFriend } from "../user/user.services.js";





export const createPost = async ({ content, title, privacy, userId}:createPostData & {userId: Types.ObjectId}) => {
    const post = await PostModel.create({
        content, 
        createdBy: userId,
        privacy: privacy as number,
        title 
    })
    return { data: {
            post
        }
    }
}

createPost
export const getPostsByUserID = async ({userId, user}: {userId: string | Types.ObjectId, user: HUser}) => {
    const isFriend = await FriendRequestModel.findOne({
        status: FriendRequestEnum.accepted,
        $or: [
            {
                to: userId,
                from: user._id
            },
            {
                to: user._id,
                from: userId
            }
        ] 
    })

    const postsPrivacy = [
        {privacy: PostPrivacyEnum.public}
    ]
    if (isFriend) { // friend
        postsPrivacy.push({ privacy: PostPrivacyEnum.friends})
    }
    if (userId == user._id.toString()) { // account owner
        postsPrivacy.push({ privacy: PostPrivacyEnum.friends}, {privacy: PostPrivacyEnum.private})
    }
    const posts = await PostModel.find({
        createdBy: userId,
        $or: postsPrivacy
    })
    return {
        data:{
            posts
        }
    }
}


export const getHomePagePosts = async ({ user }: { user: HUser}) => {
    const friends =(await listFriend({ user })).data.friends.map(friend => friend._id)
    const privacy = [
        {privacy: PostPrivacyEnum.public},
        {
            privacy: PostPrivacyEnum.friends,
            createdAt: {
                $in: friends
            }
        },
        {
            privacy: {
                $in: [PostPrivacyEnum.friends, PostPrivacyEnum.private]
            },
            createdBy: user._id
        }
    ]
    const posts = await PostModel.find({
        $or: privacy
    })
    return {
        data: posts
    }
}
