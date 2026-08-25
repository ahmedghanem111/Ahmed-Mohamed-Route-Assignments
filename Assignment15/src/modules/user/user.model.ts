import { model, Schema } from "mongoose";
import { GenderEnum, IUser, ProviderEnum, RulesEnum } from "./user.types.js";


 

const UserSchema = new Schema<IUser>({
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
        required: true 
    },
    isOnline: { 
        type: Boolean, 

    },
    isActive: { 
        type: Boolean, 
  
    },
    gender: { 
    type: Number,
    enum: Object.values(GenderEnum),
    },
    phone: { 
        type: String, 
    },
    confirmedAt: {
        type: Date 
    },
    changedCredentialsAt: { 
        type: Date 
    },
   provider: { 
   type: Number, 
   enum: Object.values(ProviderEnum), 
   },
    role: { 
    type: Number, 
    enum: Object.values(RulesEnum), 
    },
    profilePic: { 
        type: String 
    },
    coverPics: [{ 
        type: String 
    }]
},{})
  



const UserModel = model("User", UserSchema);