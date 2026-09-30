import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }: {
    to: string;
    subject: string;
    html: string;
}) => {
    const transporter = nodemailer.createTransport({
        host:"smtp.example.com",
        port: 587,
        service: "gmail",
        auth: {
            user:"ahmedmohamedghanem083@gmail.com",
            pass:"nijkjellsbnukkwx"

        }
    })

    const info = await transporter.sendMail({
    from: "Ghanem <ahmedmohamedghanem083@gmail.com>",
    to,
    subject,
    html
    })
    console.log(info.accepted)
}




 