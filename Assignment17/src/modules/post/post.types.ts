import { HydratedDocument, Types } from "mongoose"


export enum PostPrivacyEnum {
    public,
    friends,
    private
}



export interface IPost{
    title:string
    content:string
    attachment:Array<string>
    likes:Array<Types.ObjectId>
    privacy:PostPrivacyEnum,
    createdBy:Types.ObjectId
}

export type HPost = HydratedDocument<IPost>
