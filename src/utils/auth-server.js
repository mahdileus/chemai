import "server-only";
import crypto from "crypto";
import { hash, compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import UserModel from "@/models/User";
import connectToDB from "@/configs/db";

const ONE_DAY = 60 * 60 * 24;

export const ACCESS_COOKIE_NAME = "token";
export const REFRESH_COOKIE_NAME = "refreshToken";

const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

const ACCESS_EXPIRES_IN = "1h";
const REFRESH_EXPIRES_IN = "45d";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// --- Cookies ---
export async function setAuthCookies({ accessToken, refreshToken }) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_COOKIE_NAME, accessToken, {
    ...cookieBase,
    maxAge: 60 * 60, // 1h
  });

  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
    ...cookieBase,
    maxAge: 45 * ONE_DAY, // 45 days
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE_NAME, "", { ...cookieBase, maxAge: 0 });
  cookieStore.set(REFRESH_COOKIE_NAME, "", { ...cookieBase, maxAge: 0 });
}

// --- Password ---
export const hashPassword = async (password) => hash(password, 12);
export const verifyPassword = async (password, hashedPassword) => compare(password, hashedPassword);

// --- Tokens ---
export const generateAccessToken = (data) =>
  sign({ ...data }, process.env.AccessTokenSecretKey, { expiresIn: ACCESS_EXPIRES_IN });

export const verifyAccessToken = (token) => {
  try {
    return verify(token, process.env.AccessTokenSecretKey);
  } catch {
    return null;
  }
};

export const generateRefreshToken = (data) =>
  sign({ ...data }, process.env.RefreshTokenSecretKey, { expiresIn: REFRESH_EXPIRES_IN });

export const verifyRefreshToken = (token) => {
  try {
    return verify(token, process.env.RefreshTokenSecretKey);
  } catch {
    return null;
  }
};

// --- Auth helpers ---
export const authUser = async () => {
  await connectToDB();

  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME);
  if (!token?.value) return null;

  const payload = verifyAccessToken(token.value);
  if (!payload) return null;

  const query = payload.sub
    ? { _id: payload.sub }
    : payload.phone
      ? { phone: payload.phone }
      : null;

  if (!query) return null;

const user = await UserModel.findOne({ phone: payload.phone })
  .select("_id phone email role firstName lastName accountType nationalCode iban chemaiCode legalInfo avatar")
  .lean();

  if (!user) return null;

  if (user.status && user.status !== "ACTIVE") return null;
  if (user.isBlocked && user.blockedUntil && user.blockedUntil > new Date()) return null;

  return user;
};

export const authAdmin = async () => {
  const user = await authUser();
  if (!user) return null;
  if (user.role !== "ADMIN") return null;
  return user;
};

// --- Refresh token flow ---
export const refreshAccessToken = async () => {
  await connectToDB();

  const cookieStore = await cookies();
  const refreshCookie = cookieStore.get(REFRESH_COOKIE_NAME);
  if (!refreshCookie?.value) return null;

  const payload = verifyRefreshToken(refreshCookie.value);
  if (!payload) return null;

  const query = payload.sub
    ? { _id: payload.sub }
    : payload.phone
      ? { phone: payload.phone }
      : null;

  if (!query) return null;

  // refreshTokenHash باید در User داشته باشی (پیشنهاد)
  const user = await UserModel.findOne(query).select(
    "_id phone role status isBlocked blockedUntil refreshTokenHash"
  );
  if (!user) return null;

  if (user.status && user.status !== "ACTIVE") return null;
  if (user.isBlocked && user.blockedUntil && user.blockedUntil > new Date()) return null;

  // ✅ چک سروری refresh token (اگر hash ذخیره می‌کنی)
  if (user.refreshTokenHash) {
    const incomingHash = hashToken(refreshCookie.value);
    if (incomingHash !== user.refreshTokenHash) return null;
  }

  const newAccessToken = generateAccessToken({
    sub: String(user._id),
    phone: user.phone,
    role: user.role,
  });

  return { accessToken: newAccessToken, user };
};

// --- Helpers for login flow ---
export const persistRefreshToken = async ({ userId, refreshToken }) => {
  await connectToDB();
  const refreshTokenHash = hashToken(refreshToken);
  await UserModel.updateOne({ _id: userId }, { $set: { refreshTokenHash } });
};