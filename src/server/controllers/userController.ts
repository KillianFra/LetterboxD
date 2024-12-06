import express from "express";
import * as userService from "../services/userService";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import cookieParser from "cookie-parser";
const router = express.Router();

router.use(cookieParser());

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
      .select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).send("User not found");
    }

    res.json(user[0]); // Return the authenticated user details
  } catch (error) {
    res.status(401).send("Invalid or expired token");
  }
});

export default router;
