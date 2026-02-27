import mongoose from "mongoose";
const { Schema } = mongoose;

const planPurchaseSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: Schema.Types.ObjectId, ref: "Plan", required: true, index: true },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "ACTIVE", "EXPIRED", "CANCELED", "FAILED"],
      default: "PENDING",
      index: true,
    },

    startsAt: { type: Date, default: null, index: true },
    endsAt: { type: Date, default: null, index: true },

    amount: { type: Number, required: true, min: 0 },        // مبلغ نهایی
    discountAmount: { type: Number, default: 0, min: 0 },

    invoice: { type: Schema.Types.ObjectId, ref: "Invoice", default: null },
    transaction: { type: Schema.Types.ObjectId, ref: "Transaction", default: null },

    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.PlanPurchase ||
  mongoose.model("PlanPurchase", planPurchaseSchema);