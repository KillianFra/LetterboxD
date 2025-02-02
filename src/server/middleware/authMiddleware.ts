import { verifyToken } from "../services/userService";

// @ts-ignore
export const authMiddleware: RequestHandler = (req, _res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) return next('No token provided');
        const jwtToken = token.replace('Bearer ', '');
        req.user = verifyToken(jwtToken);
        next();
    } catch (err) {
        return next('Invalid token');
    }
};
