import { HydratedDocument, Types } from "mongoose"



export interface IMessage {
    
    createdBy: Types.ObjectId
    content: string
    attachment?: string[]
    createdAt?: Date
    updateAt?: Date

}

export type HMessage = HydratedDocument<IMessage>
