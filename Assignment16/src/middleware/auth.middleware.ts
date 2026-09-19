import {Request, Response, NextFunction } from "express";
import { BadRequestException, UnAuthorizedException } from "../utils/error.exceptions.js";
import { verifyToken } from "../utils/security/token.js";
import { UserModel } from "../modules/user/models/user.model.js";
import { jwtIdKey } from "../utils/redis/redis.services.js";
import { redisClient } from "../DB/redis.connection.js";
import { HUser } from "../modules/user/types/user.types.js";

export enum TokenEnum {
  access,
  refresh
}

declare module "express-serve-static-core" {
    interface Request {
        user: HUser
    }
}


export const auth = async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    const { user } = await decodeToken({ authorization: authorization as unknown as string, tokenType: TokenEnum.access });
    req.user = user;
    next();
}

export const decodeToken = async ({ authorization, tokenType = TokenEnum.access}: { authorization?: string , tokenType?: TokenEnum }) => {  
    if (!authorization) {
    throw new UnAuthorizedException();
    }
    if (!authorization.startsWith("Bearer ")) {
    throw new BadRequestException("Invalid auth method");
    }

    const token: string = authorization.split(" ")[1] as string;
    if (!token) {
        throw new UnAuthorizedException();
    }

    const payload = verifyToken(token,
        tokenType == TokenEnum.access ?
        process.env.ACCESS_JWT_SECRET as string :
        process.env.REFRESH_JWT_SECRET as string
    ) as{
        _id: string,
        iat: number,
        exp: number,
        jti: string
    }

    const user = await UserModel.findById(payload._id);
    if (!user) {
        throw new UnAuthorizedException();
    }

    if(!user.confirmedAt){
        throw new UnAuthorizedException();
    }

    const sessionKey = jwtIdKey(user.id, payload.jti);
    const session = await redisClient.get(sessionKey)
    if (!session) {
        throw new UnAuthorizedException();
    }
    return { user };
}