import { HydratedDocument, StringExpressionOperatorReturningArray, Types } from "mongoose";
import { IMessage } from "./message.type.js";




export interface IChat {
    participants: Types.ObjectId[]
    messages: IMessage[] 


    group?: string
    groupImage?: string
    roomId?: string
    
    createdBy: Types.ObjectId
    createdAt: Date
    updateAt: Date

}


export type HChat = HydratedDocument<IChat>