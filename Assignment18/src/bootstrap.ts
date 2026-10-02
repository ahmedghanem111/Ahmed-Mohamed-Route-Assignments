import express from "express"; 
import chalk from "chalk";
import morgan from "morgan";
import { DBConnection } from "./DB/mongoose.connection.js";
import { Request, Response, NextFunction } from "express";
import { IError } from "./utils/error.exceptions.js";
import { redisClient } from "./DB/redis.connection.js";
import  cors  from "cors";
import authRouter, {routes as authRoute} from "./modules/auth/auth.controller.js";
import userRouter, { routes as userRoute } from "./modules/user/user.controller.js";
import postRouter, { routes as postRoute } from "./modules/post/post.controller.js";
import { initializeTo } from "./modules/Gateway/gateway.js";
import chatRouter, {routes as chatRoute} from "./modules/chat/chat.controller.js";

import { expressMiddleware } from "@as-integrations/express5";
import {
    apolloServer,
    getGraphQLContext
} from "./graphql/graphql.js";

const app = express();


 export const bootstrap = async () => {

    app.use(cors())
    app.use(express.json()); 
    app.use(morgan("dev"));
    await DBConnection()
    await redisClient.connect()

await apolloServer.start();

app.use(
    "/graphql",
    expressMiddleware(apolloServer, {
        context: async ({ req }) => {
            return getGraphQLContext(req.headers.authorization);
        }
    })
);

    app.use(chatRoute.base, chatRouter)
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
    const httpServer = app.listen(process.env.PORT, () => {
        console.log(chalk.green("Server is running on port", process.env.PORT));
    });
    initializeTo(httpServer)
 } 

