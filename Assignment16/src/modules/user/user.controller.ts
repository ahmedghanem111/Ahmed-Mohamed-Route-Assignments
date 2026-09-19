import { Router } from "express";
import * as userValidation from "./user.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { auth } from "../../middleware/auth.middleware.js";
import { cancelFriendRequest, friendRequestReply, listFriend, listFriendRequests, sendFriendRequest } from "./user.services.js";
import { successRes } from "../../utils/success.res.js";
const router = Router();Router

export const routes = {
    base: "/users",
    sendFriendRequest: "/send-friend-request",
    friendRequestReply: "/friend-request-reply/:id",
    listFriendRequests: "/list-friend-requests",
    cancelFriendRequest: "/cancel-friend-requests/:id",
    listFriend: "/list-friends"
};


router.post(
    routes.sendFriendRequest,
    validation(userValidation.sendFriendRequestSchema),
    auth,
    async (req, res) => {
        const {to} = req.body as userValidation.sendFriendRequestData;
        const {id: from} = req.user
        await sendFriendRequest({to, from})
        return successRes({res})
    }
)

router.patch(
    routes.friendRequestReply,
    validation(userValidation.friendRequestReplySchema),
    auth,
    async (req, res) => {
        const {id} = req.params as { id: string};
        const {status} = req.body;
        const userId = req.user.id
        await friendRequestReply({id, status, userId})
        return successRes({res})
    }
)

router.get(
    routes.listFriendRequests,
    auth,
    async (req, res) => {
        const userId = req.user.id;
        const { isTo = true } = req.query
        const { data } = await listFriendRequests({ userId, isTo: JSON.parse(isTo as string) });
        return successRes({ res, data: { data } });
    }
)

router.patch(
    routes.cancelFriendRequest,
    validation(userValidation.cancelFriendRequestSchema),
    auth,
    async (req, res) => {
        const { id } = req.params as userValidation.cancelFriendRequestData
        const userId = req.user.id
        await cancelFriendRequest({id, userId})
        return successRes({res})
    }
)

router.get(
    routes.listFriend,
    auth,   
    async(req, res) =>{
        const user = req.user
       const { data } = await listFriend({user}) 
       return successRes({ res, data })
    }
) 





export default router;