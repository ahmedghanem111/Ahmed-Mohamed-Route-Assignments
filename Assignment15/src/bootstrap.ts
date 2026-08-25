import express from "express"; 
import chalk from "chalk";
import morgan from "morgan";
import { DBConnection } from "./DB/mongoose.connection.js";
import authRouter from "./modules/auth/auth.controller.js";
import { IUser } from "./modules/user/user.types.js";
import { Request, Response, NextFunction } from "express";
import { IError } from "./utils/error.exceptions.js";



const app = express();


 export const bootstrap = async () => {

    app.use(express.json()); 
    app.use(morgan("dev"));
    await DBConnection()

    app.use("/auth", authRouter);

    app.get("/hello", (req, res) => {
        res.send("Hello World");
    });


    app.use((err: IError, req: Request, res: Response, next: NextFunction) => {
        res.status(err.statusCode).json({
            errMessage: err.message,
            validationError: err.validationError,
            status: err.statusCode,
            stack: err.stack

        });
    });
    app.listen(process.env.PORT, () => {
        console.log(chalk.bgGreen.black("Server is running on port ", process.env.PORT));
    });

 } 