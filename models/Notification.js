import mongoose from "mongoose";
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // چه کسی ایجاد کرده (ادمین/سیستم/کاربر)
    actor: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },

    // نوع نوتیف (برای UI)
    type: {
      type: String,
      enum: [
        "PURCHASE_REQUEST_CREATED",
        "PROFORMA_ISSUED",
        "ORDER_STATUS_CHANGED",
        "TICKET_CREATED",
        "TICKET_REPLIED",
        "SYSTEM",
      ],
      default: "SYSTEM",
      index: true,
    },

    title: { type: String, trim: true, default: "" },
    message: { type: String, trim: true, default: "" },

    // لینک به موجودیت مربوطه (پلی‌مورفیک)
    refType: {
      type: String,
      enum: ["PurchaseRequest", "ProformaInvoice", "Order", "Ticket", ""],
      default: "",
      index: true,
    },
    refId: { type: Schema.Types.ObjectId, default: null, index: true },

    // داده اضافه برای فرانت (بدون populate)
    data: { type: Schema.Types.Mixed, default: {} },

    // وضعیت خوانده شدن
    readAt: { type: Date, default: null, index: true },

    // اگر خواستی soft-delete برای کاربر
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, deletedAt: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);