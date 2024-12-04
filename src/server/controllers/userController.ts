import express from "express";
import * as userService from "../services/userService";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import cookieParser from "cookie-parser";
const router = express.Router();

router.use(cookieParser());

router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).send("Username, password, and role are required");
  }

  try {
    const newUser = await userService.registerUser(username, password, role);
    if (!newUser) {
      return res.status(400).send("User already exists");
    }

    const token = userService.generateToken(newUser);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
      })
      .status(201)
      .json({ user: newUser });
  } catch (error) {
    res.status(500).send("Error registering user");
  }
});

// Login user and return JWT token as a cookie
router.post("/login", async (req, res) => {
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
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
      })
      .json({ user });
  } catch (error) {
    res.status(500).send("Error logging in");
  }
});

// Get current user (requires JWT token in cookies)
router.get("/me", async (req, res) => {
  // Try to get the token from cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send("Not Authenticated");
  }

  try {
    const decoded = userService.verifyToken(token);
    console.log(decoded);
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

// Logout user (clear the cookie)
router.get("/logout", (req, res) => {
  res.clearCookie("token").send("Logged out successfully");
});

export default router;
