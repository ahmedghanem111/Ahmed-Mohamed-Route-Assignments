import { nanoid } from "nanoid";
import { NotFoundException } from "../../utils/error.exceptions.js";
import { UserModel } from "../user/models/user.model.js";
import { HUser } from "../user/types/user.types.js";
import { chatModel } from "./models/chat.model.js";





export const getChat = async({user, id}: {user: HUser, id: string}) =>{
    const friend = await UserModel.findById(id)
    if(!friend){
        throw new NotFoundException("friend not found")
    }

    let chat = await chatModel.findOne({
        group: {
            $exists: false
        },
        participants: {
            $all: [friend._id, user._id]
        }
    }).populate('participants')
    if(!chat){
        chat = await chatModel.create({
            participants: [friend._id, user._id],
            createdBy: user._id
        })
    }
    return {
        data: {
            chat
        }
    }
}


export const createGroup = async({group, participants, user}: {group: string, participants: string[], user: HUser}) => {


    const foundedParticipants = await UserModel.find({
        _id: {
            $in: participants
        }
    })
    if (participants.length != foundedParticipants.length) {
        throw new NotFoundException()
    }
    const roomId = nanoid(15)
    const newGroup = await chatModel.create({
        participants,
        group,
        createdBy: user._id,
        roomId
    })
    return {
        data: {

        }
    }
}




export const getGroupChat = async({groupId, user}: {user: HUser, groupId: string}) =>{
    const chat = await chatModel.findOne({
        _id: groupId,
        group: {
            $exists: true
        },
        participants: {
            $in: [user._id]
        }
    }).populate("messages.createdBy")
    if (!chat) {
        throw new NotFoundException()
    }
    return {
        data: {
            chat
        }
    }
}