import { StringDecoder } from "string_decoder"

export const confirmEmailKey = (userId: string) => `users:${userId}:confirmEmailOtp`
export const jwtIdKey = (userId: string, jwtId: string)=> `users:${userId}:${jwtId}`

export const connectedSocketsKey = (userId: string) => `users:${userId}:sockets`