import { Router } from "express";
import { validation } from "../../middleware/validation.middleware";
import { confirmEmailData, confirmEmailSchema, loginData, loginSchema, signUpData, signupSchema } from "./auth.validation.js";
import { loginService, signupService, confirmEmail } from "./auth.services.js";
import {successRes} from "../../utils/success.res.js"

const router = Router();

export const routes = {
    base: "/auth",
    signup: "/signup",
    login: "/login",
    confirmEmail: "/confirm-email",
    me: "/me"
}



router.post(routes.signup,validation(signupSchema), async (req, res, next) => {
    const signUpData = req.body as signUpData
    const { data } = await signupService(signUpData);
    return successRes({ res, data, statusCode: 201 })
});


router.post(routes.login, validation(loginSchema), async (req, res) => {
    const body = req.body as loginData
    const { data } = await loginService(body)
    return successRes({
        res, data
    })
});


router.patch(routes.confirmEmail, validation(confirmEmailSchema), async (req, res) =>{
    const body = req.body as confirmEmailData
    await confirmEmail(body)
    return successRes({ res })
} )


router.get(routes.me, (req, res) => {
    const user = req.user
    successRes({
        res,
        data: {
            user
        }
    })
})


export default router;