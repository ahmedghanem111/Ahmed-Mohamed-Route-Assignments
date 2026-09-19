import { isValidObjectId } from "mongoose";
import z from "zod";
import { FriendRequestEnum } from "./types/friendRequest.types.js";



export const sendFriendRequestSchema = {
    body:z.strictObject({
        to: z.string().refine((value) => {
            return isValidObjectId(value)
        }, {
            error: "Invalid id value"
        }),
    })
}
export type sendFriendRequestData = z.infer<typeof sendFriendRequestSchema.body>


export const friendRequestReplySchema = {
    body: z.strictObject({
        status: z.union([
            z.literal(FriendRequestEnum.accepted),
            z.literal(FriendRequestEnum.rejected)
        ])
    }),
    params: z.strictObject({
        id: z.string().refine((value) => {
            return isValidObjectId(value)
        }, {
            error: "Invalid id value"
        }),
    }),
}
export type friendRequestReplyData = z.infer<typeof friendRequestReplySchema.body>  & z.infer<typeof friendRequestReplySchema.params>


export const cancelFriendRequestSchema = {
    params: z.strictObject({
        id: z.string().refine((value) => {
            return isValidObjectId(value)
        }, {
            error: "Invalid id value"
        }),
    })
}
export type cancelFriendRequestData = z.infer<typeof cancelFriendRequestSchema.params>
