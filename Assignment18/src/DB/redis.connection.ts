import { createClient } from "redis";
import chalk from "chalk";


export const redisClient = createClient({
    url:"redis://127.0.0.1:6379",
    database: 1
})

redisClient.on("error", (err) => {
    console.log(chalk.red("Redis connection failed => ", err));
})  

redisClient.on("connect", () => {
    console.log(chalk.green("Redis connection successfully"));
})

  