import mongoose from "mongoose";
const { Schema } = mongoose;

const gradeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true }, // Pharma / Lab / Industrial
    code: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Grade || mongoose.model("Grade", gradeSchema);