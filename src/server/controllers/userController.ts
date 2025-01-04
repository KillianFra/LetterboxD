import express, { NextFunction } from "express";
import * as userService from "../services/userService";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import cookieParser from "cookie-parser";
import { authMiddleware } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../../../types/movies";

const router = express.Router();

router.use(cookieParser());

router.get("/", async (req: any, res: any) => {
  try {
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const users = await userService.getUsers(offset);
    res.status(200).send({ status: true, users });
  } catch (error) {
    throw new Error("Invalid page number");
  }
});

router.put("/", authMiddleware, async (req: AuthenticatedRequest, res: any) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ status: false, message: "Username and password are required" });
  }
  try {
    const updatedUser = await userService.updateUser(req.body.username, req.body.password, req.user);
    const token = userService.generateToken(updatedUser);
    res.status(200).json({ status: true, user: updatedUser, token: token });
  } catch (error) {
    res.status(400).json({ status: false, message: "Error updating user" });
  }
});

router.post("/register", async (req: any, res: any) => {
  const { username, password } = req.body;
  let newUser;
  if (!username || !password) {
    return res.status(400).send("Username, password, and role are required");
  }
  try {
    newUser = await userService.registerUser(username, password);
    res.status(201).json({status: true, user: newUser });
  } catch (error) {
    if (!newUser) {
      return res.json({status: false, message: "User Already Exist"}).status(400);
    }
    res.json({status: false, message: "Error registering User"}).status(500);
  }
});

// Login user and return JWT token as a cookie
router.post("/login", async (req: any, res: any) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }
  try {
    const user = await userService.authenticateUser(username, password);

    if (!user) {
      return res.status(401).send("Invalid credentials");
    }

    const token = userService.generateToken(user);

    // Set the token as an HTTP-only cookie
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).send("Error logging in");
  }
});

// Get current user (requires JWT token in cookies)
router.get("/me", async (req: any, res: any) => {
  // Try to get the token from cookies
  const token = req.headers?.authorization;
  if (!token) {
    return res.status(401).send("Not Authenticated");
  }

  try {
    const decoded = userService.verifyToken(token);
    const user = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, decoded.id as number))
      .limit(1);
    if (user.length === 0) {
      return res.status(404).send("User not found");
    }

    res.json({status: true, user: user[0]});
  } catch (error) {
    res.status(401).send({ status: false, message: error.message });
  }
});

router.post("/delete", authMiddleware, async (req: AuthenticatedRequest, res: any, next: NextFunction) => {
  const userId = req.body.userId;
  if (userId === undefined || userId === null) {
    return res.status(400).json({ status: false, message: "User id is required" });
  }
  if (req.user.role !== "admin" && req.user.id !== userId) {
    return res.status(403).json({ status: false, message: "Unauthorized" });
  }
  try {
    const deletedUser = await userService.deleteUser(userId ? userId : req.user.id);
    if (!deletedUser) {
      return next(new Error("User not found"));
    }
    res.status(200).json({ status: true, user: deletedUser });
  } catch (error) {
    res.status(400).json({ status: false, message: "Error deleting user" });
  }
});

export default router;
