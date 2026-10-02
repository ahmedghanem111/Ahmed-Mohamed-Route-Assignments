import {Router} from 'express'
import { auth } from '../../middleware/auth.middleware.js'
import { validation } from '../../middleware/validation.middleware.js'
import * as postValidation  from "./post.validation";
import { createPost, getHomePagePosts, getPostsByUserID } from './post.services.js';
import { successRes } from '../../utils/success.res.js';
const router = Router()

export const routes = {
    base: "/posts",
    createPost: "/",
    getPostsByUserID: "/userId/:id",
    getHomePagePosts: "/home-page-posts"
} 

router.post(
    routes.createPost,
    auth,
    validation(postValidation.createPostValidationSchema),
    async(req, res) => {
        const userId = req.user._id
        const body = req.body as postValidation.createPostData 
        const { data } = await createPost({ ...body, userId})
        return successRes({
            res, 
            data
        })
    }
)


router.get(
    routes.getHomePagePosts,
    auth,
    async (req, res)=>{
        const user = req.user
        const {data} = await getHomePagePosts({user})
        return successRes({
            res, 
            data
        })
    } 
)


router.get(
    routes.getPostsByUserID,
    auth,
    validation(postValidation.getPostsByUserIdValidation),
    async (req, res) => {
        const user = req.user
        const id = req.params.id as string
        const { data } = await getPostsByUserID({
            user,
            userId: id
        })
        return successRes({
            res,
            data
        })
    }
 )










export default router
