import { Server as httpServer } from "http"
import { Server, Socket } from "socket.io";
import { decodeToken } from "../../middleware/auth.middleware.js";
import { redisClient } from "../../DB/redis.connection.js";
import { connectedSocketsKey } from "../../utils/redis/redis.services.js";
import strict from "assert/strict";
import { register } from "../chat/types/chat.gateway.js";

// const connectedSockets: Map<string, string[]> = new Map()

export const initializeTo = (httpServer: httpServer) =>{

     const io = new Server(httpServer, {
        cors: {
            origin: [
            "http://127.0.0.1:5500",
            "http://localhost:5500",
            ],
        methods: ["GET", "POST"],
        credentials: true,
        },
    });
    // const adminIo = io.of("/admin")
    // const clientIo = io.of("/client")

    io.use(async (socket, next) => {
        try{
            const token = socket.handshake.auth.token           // frontend
        //    const token = Socket.handshake.authorization        // postman
            const { user } = await decodeToken({ authorization: token})
            console.log({ user });
            socket.user = user
            next()
        } catch(err) {
            next(err as Error)
        }
    })
 
    io.on("connect", (socket: Socket) =>{
        
        registerNewUser(socket);
        socket.on("disconnect", () =>{
            revokeUser(socket)
        })
        register(socket)

    })
}



const registerNewUser = async(socket: Socket) =>{
    
    let userSockets: string | null | string[] = await redisClient.get(connectedSocketsKey(socket.user.id))
    if (userSockets) {
        userSockets = JSON.parse(userSockets)
        redisClient.set(connectedSocketsKey(socket.user.id), JSON.stringify([socket.id, ...(userSockets || [])]))
    }else
            await redisClient.set(connectedSocketsKey(socket.user.id), JSON.stringify([socket.id]))


}

const revokeUser = async(socket: Socket) =>{
    let userSockets = await redisClient.get(connectedSocketsKey(socket.user.id))
    const newUserSockets = JSON.parse(userSockets as string) as string[]
    newUserSockets.filter((ele) => {
        return ele != socket.id
    })
    if (newUserSockets.length == 0) {
        await redisClient.del(connectedSocketsKey(socket.user.id))
    }else
        await redisClient.set(connectedSocketsKey(socket.user.id), JSON.stringify([newUserSockets]))
}