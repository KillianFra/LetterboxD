import { db } from "../db";
import { users } from "../db/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { user } from "../../../types/movies";

const SECRET_KEY = process.env.JWT_SECRET_KEY;
const SALT_ROUNDS = 10;

// Register new user with hashed password
export const registerUser = async (
  username: string,
  password: string,
  role: string
) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await db.insert(users).values({
      username,
      password: hashedPassword,
      role,
    }).returning({ id: users.id, username: users.username, role: users.role })
      return user
  } catch (error) {
    throw new Error("Error registering user");
  }
};

// Authenticate user by verifying password and generating JWT token
export const authenticateUser = async (
  username: string,
  password: string
): Promise<user | null> => {
  const user: user[] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (user.length === 0) {
    return null; // No user found
  }

  const isPasswordValid = await bcrypt.compare(password, user[0].password!);

  if (!isPasswordValid) {
    return null; // Invalid password
  }

  return user[0];
};

// Generate JWT token for authenticated user
export const generateToken = (user: user): string | null => {
  if (!user) return null;
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET_KEY!,
    { expiresIn: "1h" }
  );
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, SECRET_KEY!);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
