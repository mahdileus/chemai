import mongoose from "mongoose";
const { Schema } = mongoose;

const coinTransactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    type: {
      type: String,
      enum: ["EARN", "SPEND", "REVERSAL", "ADJUSTMENT"],
      required: true,
      index: true,
    },

    // مقدار سکه (همیشه مثبت)
    amount: { type: Number, required: true, min: 0 },

    // مرتبط با چه چیزی
    refType: {
      type: String,
      enum: ["Plan", "Subscription", "Order", "Invoice", "SYSTEM", ""],
      default: "",
      index: true,
    },
    refId: { type: Schema.Types.ObjectId, default: null, index: true },

    description: { type: String, trim: true, default: "" },

    actor: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true }, // ادمین/سیستم

    // snapshot بعد از اعمال (مثل wallet)
    coinsAfter: { type: Number, default: null },
  },
  { timestamps: true }
);

coinTransactionSchema.index({ user: 1, createdAt: -1 });
coinTransactionSchema.index({ refType: 1, refId: 1, createdAt: -1 });

export default mongoose.models.CoinTransaction ||
  mongoose.model("CoinTransaction", coinTransactionSchema);