import { model, Schema } from "mongoose";
import { GenderEnum, IUser, ProviderEnum, RulesEnum } from "../types/user.types.js";
import { hash } from "../../../utils/security/hash.js";
import { decrypt, encrypt } from "../../../utils/security/encryption.js";
import { FriendRequestEnum } from "../types/friendRequest.types.js";
import { createOtp } from "../../../utils/email/createOtp.js";
import { sendEmail } from "../../../utils/email/sendEmail.js";
import generateHtml from "../../../utils/email/template.js";
import { confirmEmailKey } from "../../../utils/redis/redis.services.js";
import { redisClient } from "../../../DB/redis.connection.js";


 

const userSchema = new Schema<IUser>({
    name: { 
        type: String,    
        required: true
    },
    email: { 
        type: String,
        required: true, 
        unique: true 
    },
    bio: { 
        type: String 
    },
    age: { 
        type: Number, 
    },
    password: {
        type: String,
        required: function(this) {
            return this.provider == ProviderEnum.SYSTEM;
        } 
    },
    isOnline: { 
        type: Boolean, 

    },
    isActive: { 
        type: Boolean, 
  
    },
    gender: { 
    type: Number,
    enum: GenderEnum,
    },
    phone: { 
        type: String,
        set: function(this: IUser, value: string) {
            if (!value) return value;
            const encryptedPhone = encrypt(value);
            return encryptedPhone;
        }
    },
    confirmedAt: {
        type: Date 
    },
    changedCredentialsAt: { 
        type: Date 
    },
   provider: { 
   type: Number, 
   enum: ProviderEnum, 
   },
    role: { 
    type: Number, 
    enum: RulesEnum, 
    },
    profilePic: { 
        type: String 
    },
    coverPics: [{ 
        type: String 
    }]
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

userSchema.virtual("received", {
    localField: "_id",
    foreignField: "to",
    ref: "FriendRequest", 
    match: {status: FriendRequestEnum.accepted}
})

userSchema.virtual("sent", {
    localField: "_id",
    foreignField: "from",
    ref: "FriendRequest", 
    match: {status: FriendRequestEnum.accepted}
})
// userSchema.pre("save", async function(this: IUser) { // mongoose middleware (hooks)
//     this.password = await hash(this.password);
// })



userSchema.pre("save", async function () { // document middleware
    if(this.isNew || this.isModified("password")){
        this.password = await hash(this.password)
    }
    if(this.isNew){
        const otp = createOtp();

        console.log("OTP:", otp);
        console.log("EMAIL:", this.email);

        await sendEmail({
            to: this.email,
            subject: "confirm your email",
            html: generateHtml(otp)
        })
        console.log("EMAIL SENT");
        await redisClient.set(confirmEmailKey(this.id), otp, {
            expiration:{
                type: "EX",
                value: 5 * 60
            }
            })
    }

})

 
// userSchema.pre('findOne', function(){
//     const query = this.getQuery()
//     this.setQuery({ ...query, isActive:true})
// })

// userSchema.post('findOne', function(this, docs){
//     if (!docs) return;
//     docs.phone = decrypt(docs.phone)
// })




export const UserModel = model<IUser>("User", userSchema);