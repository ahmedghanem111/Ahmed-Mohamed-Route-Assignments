import mongoose from "mongoose";

export const DBConnection = async () => {
    await mongoose.connect(process.env.LOCAL_DB_URL as string)
    .then(() => {
        console.log("DB connected successfully");
    })
    .catch((err) => {
        console.log("DB connection failed", err);
    });
}