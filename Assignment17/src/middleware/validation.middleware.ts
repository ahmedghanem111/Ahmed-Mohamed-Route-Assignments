import { Request, Response, NextFunction } from "express";
import z from "zod";
import { validationException } from "../utils/error.exceptions.js";



export type ReqKeys = Partial<keyof Request>

export type schemaType = Partial<Record<ReqKeys, z.ZodType>>
 
export const validation = (schema: schemaType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const keys = Object.keys(schema) as ReqKeys[];
        const validationErrors: z.core.$ZodIssue[] = [];
        for (const key of keys) {
            const validationRes = await schema[key]?.safeParseAsync(req[key]);
            if (!validationRes?.success) {
                validationErrors.push(validationRes?.error.issues as unknown as z.core.$ZodIssue);
            }
        }

        if (validationErrors.length) {
            throw new validationException(validationErrors);
        }else{
            next();
        }
    }
}