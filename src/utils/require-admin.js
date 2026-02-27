import { authUser } from "@/utils/auth-server";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const user = await authUser();
  if (!user?._id) {
    return { ok: false, res: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }) };
  }
  if (user.role !== "ADMIN") {
    return { ok: false, res: NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true, user };
}