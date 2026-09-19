import { Types } from "mongoose";
import { BadRequestException, NotFoundException, UnAuthorizedException } from "../../utils/error.exceptions.js";
import { FriendRequestModel } from "./models/friendRequest.models.js";
import { UserModel } from "./models/user.model.js";
import { FriendRequestEnum } from "./types/friendRequest.types.js";
import { cancelFriendRequestData, friendRequestReplyData, sendFriendRequestData } from "./user.validation.js";
import { HUser } from "./types/user.types.js";




export const sendFriendRequest = async ({from, to}: sendFriendRequestData & {from: string}) => {
    if(from.toString() == to){
        throw new BadRequestException("You can't send friend request to yourself")
    }
    const receiver = await UserModel.findById(to);
    if(!receiver){
        throw new NotFoundException("Receiver not found")
    }
    const isFriendExist = await FriendRequestModel.findOne({
        status: {
            $in: [
                FriendRequestEnum.accepted,
                FriendRequestEnum.pending
            ]
        },
            $or: [
                {from, to},
                {to: from, from: to}
            ]
    })
    if(isFriendExist){
        throw new BadRequestException("Friend already exists")
    }
    await FriendRequestModel.create({
        from,
         to
    })
    return { data: {} }
}


export const friendRequestReply = async ({id, status, userId}:friendRequestReplyData & {userId: string}) => {
    const friendRequest = await FriendRequestModel.findById({ _id: id });
    if(!friendRequest){
        throw new NotFoundException("Friend request not found")
    }
    if(friendRequest.to.toString() !== userId){
        throw new BadRequestException("You are not authorized to reply to this friend request")
    }
    if(friendRequest.status !== FriendRequestEnum.pending){
        throw new BadRequestException("Friend request already replied")
    }
    friendRequest.status = status;
    await friendRequest.save();
    return { data: {} }
}


export const listFriendRequests = async ({ userId, isTo= true }: {userId: string | Types.ObjectId, isTo?: boolean }) => {
    const filter: {
        to?: string | Types.ObjectId,
        from?: string | Types.ObjectId,
        status: FriendRequestEnum.pending           
    } = {
        to: userId,
        status: FriendRequestEnum.pending
    }
    if (isTo == false) {
        delete filter.to
        filter.from = userId
    }
    const friendRequests = await FriendRequestModel.find(filter).populate([
        {
            path: "to",
            select: " name email _id" 
        },
        {
            path: "from",
            select: " name email _id" 
        }
    ])
    return { data: { friendRequests } };
}


export const cancelFriendRequest = async ({userId, id}: cancelFriendRequestData & {userId: string}) => {
    const friendRequest = await FriendRequestModel.findById(id)
    if (!friendRequest) {
        throw new NotFoundException("Request Not Found") 
    }
    if (friendRequest.from.toString() != userId.toString()) {
        throw new UnAuthorizedException()        
    }
    if (friendRequest.status != FriendRequestEnum.pending) {
        throw new BadRequestException("This request can not cancel")
    }
    friendRequest.status = FriendRequestEnum.canceled
    await friendRequest.save()
    return {
        data:{}
    }
} 


 export const listFriend = async ({user}: {user: HUser}) => {
    user = await user.populate([
        {
            path: "received",
            select: "_id from status ",
            populate: [
                {
                    path: "to",
                    select: " name email _id" 
                },
                {
                    path: "from",
                    select: " name email _id" 
                }
            ]
        },
        {
            path: "sent",
            select: "_id from status ",
            populate: [
                {
                    path: "to",
                    select: " name email _id" 
                },
                {
                    path: "from",
                    select: " name email _id" 
                }
            ]
        }
    ])
    
    return {
        data: {
            friends: [
                ...user.received as [HUser],
                ...user.sent as [HUser]
            ]
        }
    }
 } 
