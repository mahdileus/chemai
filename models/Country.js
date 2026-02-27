import mongoose from "mongoose";
const { Schema } = mongoose;

const countrySchema = new Schema(
  {
    title: { type: String, required: true, trim: true }, // Germany
    code: { type: String, required: false, trim: true, uppercase: true, unique: true, index: true }, // DE
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Country || mongoose.model("Country", countrySchema);