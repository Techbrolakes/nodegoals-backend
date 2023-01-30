/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()


export interface CustomRequest extends Request {
    token: string | JwtPayload;
    user: {
        id: string
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.body.token || req.query.token || req.headers['x-auth-token'];
    

    if (!token) {
        return res.status(403).json({ message: "No token, authorization denied" });
    }
    // verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt');
        (req as CustomRequest).token = decoded;
        (req as CustomRequest).user = decoded as {id: string}
    } catch (error) {
      res.status(401).json({ message: "Token is not valid" });   
    }

    // proceed with request
    next()
}


export default authMiddleware