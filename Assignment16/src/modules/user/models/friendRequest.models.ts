import { model, Schema, Types } from "mongoose";
import { FriendRequestEnum, IFriendRequest } from "../types/friendRequest.types.js";
import { object } from "zod";

 



const friendRequestSchema = new Schema<IFriendRequest>({
    from: {
         type: Types.ObjectId,
          required: true,
          ref: "User"
    },
    to: { type: Types.ObjectId,
         required: true,
         ref: "User"
    },
    status: { 
        type: Number,
        default: FriendRequestEnum.pending,
        // enum: Object.values(FriendRequestEnum)
    }
}, {
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


export const FriendRequestModel = model("FriendRequest", friendRequestSchema);
