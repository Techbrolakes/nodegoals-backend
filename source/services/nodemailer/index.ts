/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Nodemail Smtp Transporter Config
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // use SSL
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// test transporter connection
transporter.verify((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

export const sendEmail = async (mailOptions: any) => {
    try {
        await transporter.sendMail(mailOptions);
        return;
    } catch (error) {
        console.log(error);
    }
};
