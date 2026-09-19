import { model, Schema, Types } from "mongoose";
import { IPost, PostPrivacyEnum } from "./post.types.js";




export const postSchema = new Schema<IPost>({
   title: {
    type:String,
    required: true
   },
   attachment:{
        type:[String]
   },
   content: {
        type: String,
        required: function(this){
            return this.attachment.length == 0
        }
    },
    likes:{
        type:[Types.ObjectId],
        ref:"User"
    },
    privacy:{
        type: Number,
        default: PostPrivacyEnum.public
    },
    createdBy:{
        type:Types.ObjectId,
        ref: "User",
        required: true
    }
},{
     timestamps: true,
    strictQuery: true,
    strict: true,
    optimisticConcurrency: true,
    toJSON: {
        virtuals: true,
        getters: true
    },
    toObject: {
        virtuals: true,
        getters: true
    }
})


export const PostModel = model("Post", postSchema)