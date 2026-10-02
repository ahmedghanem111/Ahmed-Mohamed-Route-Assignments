import { BadRequestException } from "../../utils/error.exceptions.js";
import { loginData, signUpData } from "./auth.validation.js";
import { UserModel } from "../user/models/user.model.js";
import { sendEmail } from "../../utils/email/sendEmail.js";
import  generateHtml  from "../../utils/email/template.js";
import { createOtp } from "../../utils/email/createOtp.js";
import { redisClient } from "../../DB/redis.connection.js";
import { confirmEmailKey, jwtIdKey } from "../../utils/redis/redis.services.js"
import { confirmEmailData } from "./auth.validation.js";
import { hash } from "../../utils/security/hash.js";
import { compare } from "bcrypt";
import { generateToken } from "../../utils/security/token.js";
import { nanoid } from "nanoid";
import { version } from "punycode";




export const signupService = async (data: signUpData) => {
    
     const { name, email, password, age, gender, bio, phone } = data;
     const isEmailExist = await UserModel.findOne({ email });
     if (isEmailExist) {
        console.log({ isEmailExist });
        throw new BadRequestException("Email already exists");
     }

     const user = await UserModel.create({
        name,
        email,
        password,
        phone,
        age: age as unknown as number,
        gender,
     })
     user.save()
     return { 
        data: {user }
      };
}


export const loginService = async ({email, password}: loginData) => {
   console.log("EMAIL FROM REQUEST:", email);
    const isEmailExist = await UserModel.findOne({ 
      email,     
      confirmedAt: {
        $exists: true
    } })
    console.log("USER:", isEmailExist);

    if (!isEmailExist) {
        throw new BadRequestException("in-credentials");
    }
    console.log("PASSWORD FROM REQUEST:", password);
    console.log("PASSWORD FROM DB:", isEmailExist.password);

    if (!isEmailExist.confirmedAt) {
        throw new BadRequestException("please confirm your account first");
    }
    if (!(await compare(password, isEmailExist.password))) {
      console.log("xxxxxxxxxxx");
        throw new BadRequestException("in-credentials");
    }
    const jwtId = nanoid(20)
    const accessToken = generateToken(
        {
        _id: isEmailExist
        },
        process.env.ACCESS_JWT_SECRET as string,
        {
            expiresIn: "30M",
            jwtid: jwtId
        }
     )
         const refreshToken = generateToken(
        {
        _id: isEmailExist
        },
        process.env.REFRESH_JWT_SECRET as string,
        {
            expiresIn: "7D",
            jwtid: jwtId
        }
     )
     await redisClient.set(jwtIdKey(isEmailExist.id, jwtId), jwtId)
     return {
        data: {
            accessToken,
            refreshToken
        }
     }

}


export const confirmEmail = async ({ email, otp }: confirmEmailData) => {
     const user = await UserModel.findOne({
        email, 
        confirmedAt: {
            $exists: false
        }
     })
     if(!user){
        throw new BadRequestException("user not found")
     }
     const userOtp = await redisClient.get(confirmEmailKey(user.id))
     if(!userOtp){
        throw new BadRequestException("otp expired")
     }
     if(userOtp != otp){
        throw new BadRequestException("in-valid otp")
     }
     user.confirmedAt = new Date()
     await redisClient.del(confirmEmailKey(user.id))
     await user.save()
     return {
        data: {}
     }

}