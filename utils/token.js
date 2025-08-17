import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

/**
 * Generate a JWT token for a given user ID
 * @param {string} userId - MongoDB user ID
 * @param {string} expiresIn - token expiration (default 7d)
 * @returns {string} JWT token
 */
export const generateToken = (userId, expiresIn = "7d") => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token
 * @returns {object} decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
