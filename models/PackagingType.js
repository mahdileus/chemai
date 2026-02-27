import mongoose from "mongoose";
const { Schema } = mongoose;

const packagingTypeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true }, // Bag / Drum / IBC
    code: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.PackagingType || mongoose.model("PackagingType", packagingTypeSchema);