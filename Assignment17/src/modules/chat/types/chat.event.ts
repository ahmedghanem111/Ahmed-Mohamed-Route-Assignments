import { Socket } from "socket.io";
import { joinRoom, sendGroupMessage, sendMessage } from "./chat.socket.services.js";



export const sendMessageEvent = async (socket: Socket) =>{
    socket.on("sendMessage", (data) =>{
        return sendMessage({data, socket})
    })
}


export const joinRoomEvent = async(socket: Socket) =>{
    socket.on("join_room", ({roomId}: {roomId: string}) =>{
        return joinRoom(socket, roomId)
    })
}


export const sendGroupMessageEvent = async(socket: Socket) =>{
    socket.on("sendGroupMessage", ({content, groupId}: {content: string, groupId: string})=>{
        return sendGroupMessage(socket, { content, groupId})
    })
}