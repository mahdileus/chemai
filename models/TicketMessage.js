import mongoose from "mongoose";
const { Schema } = mongoose;

const ticketAttachmentSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    key: { type: String, trim: true, default: "" },
    mime: { type: String, trim: true, default: "" },
    size: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketMessageSchema = new Schema(
  {
    ticket: { type: Schema.Types.ObjectId, ref: "Ticket", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    body: { type: String, required: true, trim: true },

    attachments: { type: [ticketAttachmentSchema], default: [] },
  },
  { timestamps: true }
);

ticketMessageSchema.index({ ticket: 1, createdAt: 1 });

export default mongoose.models.TicketMessage ||
  mongoose.model("TicketMessage", ticketMessageSchema);