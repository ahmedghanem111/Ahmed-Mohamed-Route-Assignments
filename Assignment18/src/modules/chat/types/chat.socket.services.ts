import { Socket } from "socket.io"
import { UserModel } from "../../user/models/user.model.js"
import { NotBeforeError } from "jsonwebtoken"
import { NotFoundException } from "../../../utils/error.exceptions.js"
import { chatModel } from "../models/chat.model.js"
import { Types } from "mongoose"
import { connectedSocketsKey } from "../../../utils/redis/redis.services.js"
import { redisClient } from "../../../DB/redis.connection.js"

 



 export const sendMessage = async (
    {
        data, 
        socket
    }: {
        socket: Socket, 
        data: {
            content: string,
            sendTo: string
        }
    }) =>{
    try {
        const createdBy = socket.user.id
        const { content, sendTo } = data
        const friend = await UserModel.findById(sendTo)
        if (!friend) {
            throw new NotFoundException()
        }
        const chat = await chatModel.findOne({
            group: {
                $exists: false
            },
            participants: {
                $all: [friend._id, createdBy]
            }
        })
        if (!chat) {
            throw new NotFoundException()
        }
        chat.messages.push({
            createdBy: new Types.ObjectId(createdBy),
            content
        })
        await chat.save()
        socket.emit("successMessage", content)
        let friendSockets: string | null | string[] = await redisClient.get(connectedSocketsKey(friend.id))
        if (friendSockets) {
            socket.to(JSON.parse(friendSockets)).emit("newMessage", {
                content,
                from: socket.user
            })
        }
    } catch(err) {
        socket.emit("custom_error", err)
    }    
 }
 
 
export const joinRoom = async(socket: Socket, roomId: string) =>{
    try{ 
    const group = await chatModel.findOne({
        group: {
            $exists: true
        },
        participants: {
            $in: [socket.user._id]
        },
        roomId
    })
        if (!group) {
            throw new NotFoundException()
    }
        socket.join(roomId)
    } catch(err) {
        socket.emit("custom_error", err)
    }  
}


export const sendGroupMessage = async(socket: Socket, {content, groupId}: {content: string, groupId: string}) =>{
    try{
    const createdBy = socket.user._id
    const group = await chatModel.findOne({
        group: {
            $exists: true
        },
        participants: {
            $in: [createdBy]
        },
        _id: groupId
    })
    if (!group) {
        throw new NotFoundException()
    }
     group.messages.push({
        content,
        createdBy
     })
     await group.save()
     socket.emit("successMessage", content)
     socket.to(group.roomId as string).emit("newMessage", {
        content,
        from: socket.user,
        groupId
     })
    }catch(err){
        socket.emit("custom_error", err)
    }
}