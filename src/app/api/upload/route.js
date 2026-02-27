import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { authUser } from "@/utils/auth-server";
import connectToDB from "@/configs/db";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  // images
  "image/jpeg",
  "image/png",
  "image/webp",
  // documents
  "application/pdf",
];

function safeExtFromMime(mime) {
  const map = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
  };
  return map[mime] || "";
}

function sanitizeFolder(folder) {
  const f = String(folder || "general")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, "");
  return f || "general";
}

export async function POST(req) {
  try {
    await connectToDB();
    const user = await authUser();

    if (!user) {
      return NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = sanitizeFolder(formData.get("folder")); // e.g. "coa", "products"

    if (!file || typeof file === "string") {
      return NextResponse.json({ message: "فایل ارسال نشده است." }, { status: 400 });
    }

    const mime = file.type || "application/octet-stream";
    const size = Number(file.size || 0);

    if (!ALLOWED_MIME_TYPES.includes(mime)) {
      return NextResponse.json(
        { message: "نوع فایل مجاز نیست. فقط JPG/PNG/WEBP/PDF مجاز است." },
        { status: 400 }
      );
    }

    if (size <= 0) {
      return NextResponse.json({ message: "فایل نامعتبر است." }, { status: 400 });
    }

    if (size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "حجم فایل بیشتر از حد مجاز است (حداکثر ۱۰ مگابایت)." },
        { status: 400 }
      );
    }

    const ext = safeExtFromMime(mime);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const datePart = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    const randomPart = crypto.randomBytes(8).toString("hex");
    const baseName = `${Date.now()}-${randomPart}${ext}`;

    // ذخیره در public/uploads/{folder}/{date}/filename
    const relativeDir = path.join("uploads", folder, datePart);
    const uploadDir = path.join(process.cwd(), "public", relativeDir);

    await fs.mkdir(uploadDir, { recursive: true });

    const absoluteFilePath = path.join(uploadDir, baseName);
    await fs.writeFile(absoluteFilePath, buffer);

    const relativeFilePath = `/${relativeDir.replace(/\\/g, "/")}/${baseName}`;
    const key = `${folder}/${datePart}/${baseName}`;

    return NextResponse.json(
      {
        message: "فایل با موفقیت آپلود شد.",
        file: {
          url: relativeFilePath,
          key,
          mime,
          size,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ message: "خطا در آپلود فایل." }, { status: 500 });
  }
}