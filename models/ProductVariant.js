import mongoose from "mongoose";
const { Schema } = mongoose;

const attributeSchema = new Schema(
  {
    key: { type: String, trim: true },
    value: { type: String, trim: true },
    isFilterable: { type: Boolean, default: false, index: true },
  },
  { _id: false }
);

const productVariantSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },

    // فیلترها
    pharmacopeia: { type: Schema.Types.ObjectId, ref: "Pharmacopeia", default: null, index: true },
    grade: { type: Schema.Types.ObjectId, ref: "Grade", default: null, index: true },
    form: { type: Schema.Types.ObjectId, ref: "Form", default: null, index: true },

    // بسته‌بندی‌های مجاز برای این Variant
    allowedPackagingTypes: [{ type: Schema.Types.ObjectId, ref: "PackagingType", index: true }],

    // تولیدکننده/کشور (ادمین‌محور)
    manufacturer: { type: Schema.Types.ObjectId, ref: "Manufacturer", default: null, index: true },
    originCountry: { type: Schema.Types.ObjectId, ref: "Country", default: null, index: true },

    // ویژگی‌های اضافه (ممکنه بعضیا فیلتر بشن)
    attributes: { type: [attributeSchema], default: [] },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// جلوگیری از تکرار Variant برای یک ترکیب خاص (اختیاری ولی مفید)
productVariantSchema.index(
  { product: 1, pharmacopeia: 1, grade: 1, form: 1, manufacturer: 1, originCountry: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export default mongoose.models.ProductVariant || mongoose.model("ProductVariant", productVariantSchema);