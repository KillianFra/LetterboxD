import { db } from "../db";
import { users } from "../db/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { user, userToken } from "../../../types/movies";

const SECRET_KEY = process.env.JWT_SECRET_KEY;
const SALT_ROUNDS = 10;

export const getUsers = async (offset: number) => {
  try {
    const usersList = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role
      })
      .from(users)
      .limit(50)
      .offset(offset * 50);
    return usersList;
  } catch (error) {
    throw new Error("Error fetching users");
  }
};

export const updateUser = async (username: string, password: string, user: user) => {
  try {
    const updatedUser = await db
      .update(users)
      .set({ username: username, password: password })
      .where(eq(users.id, user.id!))
      .returning({ id: users.id, username: users.username, role: users.role });
    return updatedUser[0];
  } catch (error) {
    throw new Error("Error updating user");
  }
}


// Register new user with hashed password
export const registerUser = async (
  username: string,
  password: string,
) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await db.insert(users).values({
      username,
      password: hashedPassword,
    }).returning({ id: users.id, username: users.username, role: users.role })
    return user[0]
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

  const userToken: userToken = {
    id: user[0].id,
    username: user[0].username,
    role: user[0].role,
  };

  return userToken;
};

// Generate JWT token for authenticated user
export const generateToken = (user: userToken): string | null => {
  if (!user.id || !user.username || !user.role) return null;
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET_KEY!,
    { expiresIn: "1h" }
  );
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    const jwtToken = token.replace("Bearer ", "");
    return jwt.verify(jwtToken, SECRET_KEY!);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
