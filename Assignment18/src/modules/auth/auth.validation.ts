import z, { email } from "zod";
import { schemaType } from "../../middleware/validation.middleware.js";
import { GenderEnum } from "../user/types/user.types.js";



export const signupSchema = {
    body: z.strictObject({
        name: z.string(),
        email: z.email(),
        password: z.string().regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_-])(?=.*[0-9]).{8,}$/),
        age: z.string(),
        gender: z.union([
            z.literal(GenderEnum.MALE), 
            z.literal(GenderEnum.FEMALE)
        ]),
        bio: z.string().min(10),
        phone: z.string()
    })
}
export type signUpData = z.infer<typeof signupSchema.body>



export const loginSchema = {
    body: z.strictObject({
        email: z.email(),
        password: z.string().regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_-])(?=.*[0-9]).{8,}$/),
    })
}
export type loginData = z.infer<typeof loginSchema.body>



export const confirmEmailSchema = {
    body: z.strictObject({
        email: z.email(),
        otp: z.string()
    })
}
export type confirmEmailData = z.infer<typeof confirmEmailSchema.body>









