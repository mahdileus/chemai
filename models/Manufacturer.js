import mongoose from "mongoose";
const { Schema } = mongoose;

const manufacturerSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    country: { type: Schema.Types.ObjectId, ref: "Country", default: null, index: true },
    website: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

manufacturerSchema.index({ title: "text" });

export default mongoose.models.Manufacturer || mongoose.model("Manufacturer", manufacturerSchema);