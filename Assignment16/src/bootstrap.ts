import express from "express"; 
import chalk from "chalk";
import morgan from "morgan";
import { DBConnection } from "./DB/mongoose.connection.js";
import { Request, Response, NextFunction } from "express";
import { IError } from "./utils/error.exceptions.js";
import { redisClient } from "./DB/redis.connection.js";
import authRouter, {routes as authRoute} from "./modules/auth/auth.controller.js";
import userRouter, { routes as userRoute } from "./modules/user/user.controller.js";
import postRouter, { routes as postRoute } from "./modules/post/post.controller.js";

const app = express();


 export const bootstrap = async () => {

    app.use(express.json()); 
    app.use(morgan("dev"));
    await DBConnection()
    await redisClient.connect()

    app.use(postRoute.base, postRouter)
    app.use(userRoute.base, userRouter);
    app.use(authRoute.base, authRouter);
    
    app.use((err: IError, req: Request, res: Response, next: NextFunction) => {
        res.status(err.statusCode || 500).json({
            errMessage: err.message,
            status: err.statusCode || 500,
            stack: err.stack,
            validationError: err.validationError

        });
    });
    app.listen(process.env.PORT, () => {
        console.log(chalk.green("Server is running on port", process.env.PORT));
    });

 } 