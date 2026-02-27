import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDB from "@/configs/db";
import Category from "@/models/Category";
import { authAdmin } from "@/utils/auth-server";

function toPlain(doc) {
  return JSON.parse(JSON.stringify(doc));
}

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-_]/g, "");
}

async function getDescendantIds(rootId) {
  // BFS ساده (برای جلوگیری از لوپ در تغییر parent)
  const descendants = new Set();
  const queue = [String(rootId)];

  while (queue.length) {
    const currentId = queue.shift();
    const children = await Category.find({ parent: currentId }).select("_id").lean();

    for (const child of children) {
      const childId = String(child._id);
      if (!descendants.has(childId)) {
        descendants.add(childId);
        queue.push(childId);
      }
    }
  }

  return descendants;
}

async function calcLevel(parentId) {
  if (!parentId) return 0;

  const parent = await Category.findById(parentId).select("_id level");
  if (!parent) throw new Error("PARENT_NOT_FOUND");

  const level = (parent.level ?? 0) + 1;
  if (level > 2) throw new Error("MAX_DEPTH_EXCEEDED");

  return level;
}

async function updateChildrenLevels(parentId, parentLevel) {
  // اگر parent level عوض شد، level فرزندها هم باید آپدیت شود
  const children = await Category.find({ parent: parentId }).select("_id").lean();

  for (const child of children) {
    const childLevel = parentLevel + 1;
    if (childLevel > 2) {
      throw new Error("MAX_DEPTH_EXCEEDED");
    }

    await Category.findByIdAndUpdate(child._id, { $set: { level: childLevel } });
    await updateChildrenLevels(child._id, childLevel);
  }
}

// PATCH /api/admin/categories/:id
// body: { title?, slug?, parent?, isActive?, sortOrder? }
export async function PATCH(req, { params }) {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "شناسه نامعتبر است" }, { status: 400 });
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, message: "دسته‌بندی پیدا نشد" }, { status: 404 });
    }

    const body = await req.json();
    const updateData = {};

    // title
    if (body.title !== undefined) {
      const title = String(body.title || "").trim();
      if (!title) {
        return NextResponse.json({ success: false, message: "عنوان نمی‌تواند خالی باشد" }, { status: 400 });
      }
      updateData.title = title;
    }

    // slug
    if (body.slug !== undefined) {
      const slug = slugify(body.slug);
      if (!slug) {
        return NextResponse.json({ success: false, message: "اسلاگ نامعتبر است" }, { status: 400 });
      }
      updateData.slug = slug;
    }

    // isActive
    if (body.isActive !== undefined) {
      updateData.isActive = !!body.isActive;
    }

    // sortOrder
    if (body.sortOrder !== undefined) {
      const sortOrder = Number(body.sortOrder);
      if (!Number.isFinite(sortOrder)) {
        return NextResponse.json({ success: false, message: "ترتیب نامعتبر است" }, { status: 400 });
      }
      updateData.sortOrder = sortOrder;
    }

    // parent + level
    let parentChanged = false;
    if (body.parent !== undefined) {
      let newParent = body.parent;

      // null یا "" یعنی ریشه
      if (newParent === "" || newParent === null) {
        newParent = null;
      }

      if (newParent && !mongoose.Types.ObjectId.isValid(newParent)) {
        return NextResponse.json({ success: false, message: "شناسه والد نامعتبر است" }, { status: 400 });
      }

      // خودش والد خودش نشود
      if (newParent && String(newParent) === String(category._id)) {
        return NextResponse.json({ success: false, message: "دسته نمی‌تواند والد خودش باشد" }, { status: 400 });
      }

      // والد، یکی از فرزندهای خودش نباشد (لوپ)
      if (newParent) {
        const descendants = await getDescendantIds(category._id);
        if (descendants.has(String(newParent))) {
          return NextResponse.json(
            { success: false, message: "والد انتخاب‌شده نامعتبر است (ایجاد حلقه)" },
            { status: 400 }
          );
        }
      }

      let newLevel = 0;
      try {
        newLevel = await calcLevel(newParent);
      } catch (e) {
        if (e.message === "PARENT_NOT_FOUND") {
          return NextResponse.json({ success: false, message: "دسته والد پیدا نشد" }, { status: 404 });
        }
        if (e.message === "MAX_DEPTH_EXCEEDED") {
          return NextResponse.json({ success: false, message: "حداکثر عمق دسته‌بندی ۳ سطح است" }, { status: 400 });
        }
        throw e;
      }

      updateData.parent = newParent;
      updateData.level = newLevel;
      parentChanged = true;
    }

    // اگر title یا parent تغییر می‌کند، unique در یک سطح را دستی هم چک کن (پیام بهتر)
    const nextTitle = updateData.title ?? category.title;
    const nextParent =
      updateData.parent !== undefined ? updateData.parent : category.parent ?? null;

    const duplicate = await Category.findOne({
      _id: { $ne: category._id },
      title: nextTitle,
      parent: nextParent,
    }).select("_id");

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "در این سطح، دسته‌ای با این عنوان وجود دارد" },
        { status: 409 }
      );
    }

    const updated = await Category.findByIdAndUpdate(category._id, { $set: updateData }, { new: true });

    // اگر parent عوض شد، level فرزندها هم sync شود
    if (parentChanged) {
      try {
        await updateChildrenLevels(updated._id, updated.level ?? 0);
      } catch (e) {
        if (e.message === "MAX_DEPTH_EXCEEDED") {
          return NextResponse.json(
            { success: false, message: "تغییر والد باعث عبور از حداکثر عمق مجاز می‌شود" },
            { status: 400 }
          );
        }
        throw e;
      }
    }

    const finalDoc = await Category.findById(updated._id).lean();

    return NextResponse.json({
      success: true,
      message: "دسته‌بندی با موفقیت ویرایش شد",
      data: toPlain(finalDoc),
    });
  } catch (err) {
    console.error("PATCH /api/admin/categories/[id] error:", err);

    if (err?.code === 11000) {
      if (err?.keyPattern?.slug) {
        return NextResponse.json({ success: false, message: "اسلاگ تکراری است" }, { status: 409 });
      }
      return NextResponse.json({ success: false, message: "اطلاعات تکراری است" }, { status: 409 });
    }

    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/admin/categories/:id
// پیشنهاد: hard delete فقط اگر فرزند/استفاده نداشته باشد
// فعلاً: اگر فرزند داشته باشد خطا می‌دهد؛ وگرنه حذف می‌کند
export async function DELETE(req, { params }) {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "شناسه نامعتبر است" }, { status: 400 });
    }

    const category = await Category.findById(id).select("_id title");
    if (!category) {
      return NextResponse.json({ success: false, message: "دسته‌بندی پیدا نشد" }, { status: 404 });
    }

    // 1) اگر فرزند دارد، حذف نکن
    const hasChildren = await Category.exists({ parent: category._id });
    if (hasChildren) {
      return NextResponse.json(
        { success: false, message: "این دسته زیرمجموعه دارد و قابل حذف نیست" },
        { status: 400 }
      );
    }

    // 2) (اختیاری ولی مهم) اگر در Product استفاده شده هم حذف نکن
    // اگر مدل Product شما در مسیر دیگری است، ایمپورتش کن و این بخش را فعال کن:
    // const usedInProduct = await Product.exists({ category: category._id });
    // if (usedInProduct) {
    //   return NextResponse.json(
    //     { success: false, message: "این دسته در محصولات استفاده شده و قابل حذف نیست" },
    //     { status: 400 }
    //   );
    // }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "دسته‌بندی با موفقیت حذف شد",
    });
  } catch (err) {
    console.error("DELETE /api/admin/categories/[id] error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}