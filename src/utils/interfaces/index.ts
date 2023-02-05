import { Request } from "express";
export interface IRequest extends Request {
    user: {
     id: string;
 }
}
export interface IMailOptions {
    email: string,
    subject: string,
    message: string,
    duration: number
}