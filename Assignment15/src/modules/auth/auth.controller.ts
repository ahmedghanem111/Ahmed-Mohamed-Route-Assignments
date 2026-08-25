import { Router } from "express";
import { validation } from "../../middleware/validation.middleware";
import { loginSchema } from "./auth.validation.js";
import { loginService } from "./auth.services.js";
const router = Router();


router.post('/login', validation(loginSchema), (req, res, next) => {
    const { data } = loginService(req.body, req.query);
    res.json({ data }); 
});


export default router;