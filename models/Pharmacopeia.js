import mongoose from "mongoose";
const { Schema } = mongoose;

const pharmacopeiaSchema = new Schema(
  {
    title: { type: String, required: true, trim: true }, // United States Pharmacopeia
    code: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true }, // USP
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Pharmacopeia || mongoose.model("Pharmacopeia", pharmacopeiaSchema);