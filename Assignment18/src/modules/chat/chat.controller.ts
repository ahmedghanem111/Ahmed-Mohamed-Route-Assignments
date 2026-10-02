import { Router } from "express"
import { createGroup, getChat, getGroupChat } from "./chat.services.js"
import { auth } from "../../middleware/auth.middleware.js"
import { successRes } from "../../utils/success.res.js"


const router = Router()


export const routes = {
    base: "/chats",
    getChat: "/:id",
    createGroup: "/create-group",
    getGroupChat: "/get-group-chat/:id"

}


router.get(routes.getChat, auth, async (req, res) => {
    const { user } = req
    const id = req.params.id as string
    const { data } = await getChat({ user, id })
    return successRes({ res, data })
})


router.get(routes.createGroup, auth, async (req, res) => {
    const { group, participants } = req.body
    const user = req.user
    const {data} = await createGroup({ group, participants, user})
    return successRes({res, data})
})


router.get(routes.getGroupChat, auth, async (req, res) =>{
    const groupId = req.params.id as string
    const user = req.user
    const {data} = await getGroupChat({
        user,
        groupId
    })
    return successRes({
        res,
        data
    })
})












export default router