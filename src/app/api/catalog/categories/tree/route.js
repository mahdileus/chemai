import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import Category from "@/models/Category";

export const runtime = "nodejs";

function buildCategoryTree(items) {
  const map = new Map();
  const roots = [];

  for (const item of items) {
    map.set(String(item._id), {
      _id: item._id,
      title: item.title,
      slug: item.slug,
      parent: item.parent || null,
      level: item.level ?? 0,
      sortOrder: item.sortOrder ?? 0,
      children: [],
    });
  }

  for (const item of items) {
    const id = String(item._id);
    const parentId = item.parent ? String(item.parent) : null;

    if (parentId && map.has(parentId)) {
      map.get(parentId).children.push(map.get(id));
    } else {
      roots.push(map.get(id));
    }
  }

  const sortRecursive = (nodes) => {
    nodes.sort((a, b) => {
      if ((a.sortOrder ?? 0) !== (b.sortOrder ?? 0)) {
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      }
      return String(a.title).localeCompare(String(b.title), "fa");
    });
    for (const n of nodes) sortRecursive(n.children || []);
  };

  sortRecursive(roots);
  return roots;
}

export async function GET() {
  try {
    await connectToDB();

    const categories = await Category.find({ isActive: true })
      .select("_id title slug parent level sortOrder")
      .lean();

    const tree = buildCategoryTree(categories);

    return NextResponse.json({ items: tree });
  } catch (error) {
    console.error("GET /api/catalog/categories/tree error:", error);
    return NextResponse.json(
      { message: "خطا در دریافت دسته‌بندی‌ها." },
      { status: 500 }
    );
  }
}