import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDB from "@/configs/db";
import Category from "@/models/Category";
import { authAdmin } from "@/utils/auth-server";

function toPlain(doc) {
  return JSON.parse(JSON.stringify(doc));
}

function buildTree(categories) {
  const map = new Map();
  const roots = [];

  // clone + children
  categories.forEach((c) => {
    map.set(String(c._id), { ...c, children: [] });
  });

  categories.forEach((c) => {
    const id = String(c._id);
    const parentId = c.parent ? String(c.parent) : null;

    if (parentId && map.has(parentId)) {
      map.get(parentId).children.push(map.get(id));
    } else {
      roots.push(map.get(id));
    }
  });

  // sort children recursively by sortOrder then title
  const sortRecursive = (nodes) => {
    nodes.sort((a, b) => {
      if ((a.sortOrder || 0) !== (b.sortOrder || 0)) {
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      }
      return String(a.title || "").localeCompare(String(b.title || ""), "fa");
    });
    nodes.forEach((n) => sortRecursive(n.children));
  };

  sortRecursive(roots);
  return roots;
}

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-_]/g, "");
}

async function calcLevel(parentId) {
  if (!parentId) return 0;

  const parent = await Category.findById(parentId).select("_id level parent");
  if (!parent) {
    throw new Error("PARENT_NOT_FOUND");
  }

  const level = (parent.level ?? 0) + 1;
  if (level > 2) {
    throw new Error("MAX_DEPTH_EXCEEDED");
  }

  return level;
}

// GET /api/admin/categories
// query params:
// - tree=1   => خروجی درختی
// - flat=1   => خروجی لیست ساده
// - isActive=true/false (اختیاری)
export async function GET(req) {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const wantTree = searchParams.get("tree") === "1";
    const onlyActive = searchParams.get("isActive");

    const query = {};
    if (onlyActive === "true") query.isActive = true;
    if (onlyActive === "false") query.isActive = false;

    const categories = await Category.find(query)
      .select("_id title slug parent isActive sortOrder level createdAt updatedAt")
      .sort({ sortOrder: 1, title: 1 })
      .lean();

    const plain = toPlain(categories);

    if (wantTree) {
      return NextResponse.json({
        success: true,
        data: buildTree(plain),
      });
    }

    // flat یا default
    return NextResponse.json({
      success: true,
      data: plain,
    });
  } catch (err) {
    console.error("GET /api/admin/categories error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// POST /api/admin/categories
// body: { title, slug?, parent?, isActive?, sortOrder? }
export async function POST(req) {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const title = String(body.title || "").trim();
    const rawSlug = body.slug ? String(body.slug).trim() : "";
    const slug = slugify(rawSlug || title);
    const parent = body.parent || null;
    const isActive = typeof body.isActive === "boolean" ? body.isActive : true;
    const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "عنوان دسته‌بندی الزامی است" },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "اسلاگ معتبر نیست" },
        { status: 400 }
      );
    }

    let parentId = null;
    if (parent) {
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        return NextResponse.json(
          { success: false, message: "شناسه والد نامعتبر است" },
          { status: 400 }
        );
      }
      parentId = parent;
    }

    let level = 0;
    try {
      level = await calcLevel(parentId);
    } catch (e) {
      if (e.message === "PARENT_NOT_FOUND") {
        return NextResponse.json(
          { success: false, message: "دسته والد پیدا نشد" },
          { status: 404 }
        );
      }
      if (e.message === "MAX_DEPTH_EXCEEDED") {
        return NextResponse.json(
          { success: false, message: "حداکثر عمق دسته‌بندی ۳ سطح است" },
          { status: 400 }
        );
      }
      throw e;
    }

    // جلوگیری از تکرار title در یک سطح
    const duplicateTitle = await Category.findOne({
      title,
      parent: parentId,
    }).select("_id");

    if (duplicateTitle) {
      return NextResponse.json(
        { success: false, message: "در این سطح، دسته‌ای با این عنوان وجود دارد" },
        { status: 409 }
      );
    }

    const created = await Category.create({
      title,
      slug,
      parent: parentId,
      isActive,
      sortOrder,
      level,
    });

    return NextResponse.json(
      {
        success: true,
        message: "دسته‌بندی با موفقیت ساخته شد",
        data: toPlain(created),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/admin/categories error:", err);

    // duplicate slug / index
    if (err?.code === 11000) {
      if (err?.keyPattern?.slug) {
        return NextResponse.json(
          { success: false, message: "اسلاگ تکراری است" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, message: "اطلاعات تکراری است" },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}