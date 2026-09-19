import mongoose from "mongoose";
import chalk from "chalk";

export const DBConnection = async () => {
    await mongoose.connect(process.env.LOCAL_DB_URL as string)
    .then(() => {
        console.log(chalk.green("DB connected successfully "));
    })
    .catch((err) => {
        console.log(chalk.red("DB connection failed"), err);
    });
}