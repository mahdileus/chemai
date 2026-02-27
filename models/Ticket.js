import mongoose from "mongoose";
const { Schema } = mongoose;

const ticketSchema = new Schema(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // اگر ادمین/پشتیبان assign شد
    assignee: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },

    subject: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: "" }, // مثلا "پرداخت" "سفارش" ...

    status: {
      type: String,
      enum: ["OPEN", "WAITING_USER", "WAITING_SUPPORT", "CLOSED"],
      default: "OPEN",
      index: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
      index: true,
    },

    // لینک اختیاری به سفارش/پیش‌فاکتور...
    refType: {
      type: String,
      enum: ["Order", "PurchaseRequest", "ProformaInvoice", ""],
      default: "",
      index: true,
    },
    refId: { type: Schema.Types.ObjectId, default: null, index: true },

    lastMessageAt: { type: Date, default: Date.now, index: true },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ticketSchema.index({ createdBy: 1, status: 1, lastMessageAt: -1 });
ticketSchema.index({ assignee: 1, status: 1, lastMessageAt: -1 });

export default mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);