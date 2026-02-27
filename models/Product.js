// models/Product.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const specSchema = new Schema(
  {
    label: { type: String, trim: true, required: true },
    value: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },

    // دسته‌بندی نهایی (leaf)
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },

    // توضیحات
    shortDescription: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },

    // تصاویر
    featuredImage: { type: String, trim: true, default: "" },
    images: [{ type: String, trim: true }],

    // فیلترهای استاندارد
    pharmacopeia: { type: Schema.Types.ObjectId, ref: "Pharmacopeia", default: null, index: true },
    grade: { type: Schema.Types.ObjectId, ref: "Grade", default: null, index: true },
    form: { type: Schema.Types.ObjectId, ref: "Form", default: null, index: true },
    manufacturer: { type: Schema.Types.ObjectId, ref: "Manufacturer", default: null, index: true },
    originCountry: { type: Schema.Types.ObjectId, ref: "Country", default: null, index: true },
    packagingType: {
      type: Schema.Types.ObjectId,
      ref: "PackagingType",
      default: null,
      index: true,
    },
    // کدها
    casNumber: { type: String, trim: true, index: true, default: "" },
    hsCode: { type: String, trim: true, index: true, default: "" },

    isActive: { type: Boolean, default: true, index: true },

    // جدول مشخصات
    specs: { type: [specSchema], default: [] },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", shortDescription: "text", description: "text" });

export default mongoose.models.Product || mongoose.model("Product", productSchema);