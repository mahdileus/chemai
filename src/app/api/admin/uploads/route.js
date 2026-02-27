import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import crypto from "crypto";
import connectToDB from "@/configs/db";
import { authUser } from "@/utils/auth-server";

export const runtime = "nodejs";

async function requireAdmin() {
  await connectToDB();
  const user = await authUser();

  if (!user) {
    return { error: NextResponse.json({ message: "ابتدا وارد حساب شوید." }, { status: 401 }) };
  }

  if (user.role !== "ADMIN") {
    return { error: NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 }) };
  }

  return { user };
}

function safeFileName(name = "") {
  return String(name)
    .replace(/[^\u0600-\u06FFa-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function extFromMimeOrName(file) {
  const mime = file?.type || "";
  const name = file?.name || "";

  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "application/pdf") return ".pdf";

  const ext = path.extname(name || "").toLowerCase();
  return ext || "";
}

/**
 * POST /api/admin/uploads
 * form-data:
 * - files: File | File[]
 * - folder?: string   (مثلاً "products" یا "coa")
 */
export async function POST(req) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const formData = await req.formData();
    const files = formData.getAll("files");
    const folder = String(formData.get("folder") || "products").trim();

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "فایلی ارسال نشده است." }, { status: 400 });
    }

    // مسیر ذخیره روی لوکال
    const relativeDir = path.join("uploads", folder);
    const absoluteDir = path.join(process.cwd(), "public", relativeDir);

    if (!existsSync(absoluteDir)) {
      await fs.mkdir(absoluteDir, { recursive: true });
    }

    const uploaded = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      // محدودیت نمونه (قابل تغییر)
      const allowedMimes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!allowedMimes.includes(file.type)) {
        return NextResponse.json(
          { message: `فرمت فایل مجاز نیست: ${file.type || file.name}` },
          { status: 400 }
        );
      }

      // مثال محدودیت حجم: 10MB
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          { message: `حجم فایل ${file.name} بیشتر از 10MB است.` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = extFromMimeOrName(file);
      const baseName = safeFileName(path.basename(file.name, path.extname(file.name)));
      const unique = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
      const fileName = `${baseName || "file"}-${unique}${ext}`;

      const absolutePath = path.join(absoluteDir, fileName);
      await fs.writeFile(absolutePath, buffer);

      const url = `/${relativeDir.replace(/\\/g, "/")}/${fileName}`;

      uploaded.push({
        url,
        key: `${folder}/${fileName}`, // بعداً برای CDN خیلی به درد می‌خوره
        mime: file.type || "",
        size: file.size || 0,
        originalName: file.name || "",
      });
    }

    return NextResponse.json(
      {
        message: "فایل‌ها با موفقیت آپلود شدند.",
        files: uploaded,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/uploads error:", error);
    return NextResponse.json({ message: "خطا در آپلود فایل." }, { status: 500 });
  }
}