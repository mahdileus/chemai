import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },

    purpose: {
      type: String,
      enum: ["signup", "login", "change_phone", "reset_password"],
      default: "signup",
      index: true,
    },

    codeHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      // index: true  ❌ این را حذف کن تا duplicate نشه
    },

    attempts: { type: Number, default: 0 },
    blockedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

// TTL دقیق روی expiresAt
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// فقط یک OTP فعال برای هر phone+purpose
otpSchema.index({ phone: 1, purpose: 1 }, { unique: true });

export default mongoose.models.Otp || mongoose.model("Otp", otpSchema);