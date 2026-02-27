import mongoose from "mongoose";
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    // null = دسته مادر
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },

    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },

    // اختیاری ولی مفید برای UI
    level: { type: Number, default: 0, min: 0, max: 2, index: true }, // مادر=0، زیر=1، زیرزیر=2
  },
  { timestamps: true }
);

categorySchema.index({ parent: 1, sortOrder: 1 });
categorySchema.index({ parent: 1, title: 1 }, { unique: true });

export default mongoose.models.Category || mongoose.model("Category", categorySchema);