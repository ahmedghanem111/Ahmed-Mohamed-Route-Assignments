import { Socket } from "socket.io";
import { joinRoomEvent, sendGroupMessageEvent, sendMessageEvent } from "./chat.event.js";


export const register = (socket: Socket) =>{
    sendMessageEvent(socket)
    joinRoomEvent(socket)
    sendGroupMessageEvent(socket)
}