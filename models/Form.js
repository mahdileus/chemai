import mongoose from "mongoose";
const { Schema } = mongoose;

const formSchema = new Schema(
  {
    title: { type: String, required: true, trim: true }, // Powder / Liquid / Granule ...
    code: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Form || mongoose.model("Form", formSchema);