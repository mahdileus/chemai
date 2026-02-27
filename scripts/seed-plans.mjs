import connectToDB from "../configs/db.js";
import Plan from "../models/Plan.js";

const plans = [
  {
    code: "HYDROGEN",
    title: "هیدروژن",
    durationDays: 365,
    price: 0,
    currency: "IRR",
    features: {
      maxListings: 5,
      liftPerMonth: 1,
      tenderAuctionPerYear: 0,
      marketplaceBannerPerYear: 0,
      smsMarketing: false,
      chemaiCreditTier: "NONE",
    },
    sortOrder: 1,
    isActive: true,
  },
  {
    code: "CARBON",
    title: "کربن",
    durationDays: 365,
    price: 6000000,
    currency: "IRR",
    features: {
      maxListings: 15,
      liftPerMonth: 4,
      tenderAuctionPerYear: 2,
      marketplaceBannerPerYear: 2,
      smsMarketing: false,
      chemaiCreditTier: "B",
    },
    sortOrder: 2,
    isActive: true,
  },
  {
    code: "SILVER",
    title: "نقره",
    durationDays: 365,
    price: 12000000,
    currency: "IRR",
    features: {
      maxListings: 30,
      liftPerMonth: 8,
      tenderAuctionPerYear: 5,
      marketplaceBannerPerYear: 4,
      smsMarketing: false,
      chemaiCreditTier: "A",
    },
    sortOrder: 3,
    isActive: true,
  },
  {
    code: "GOLD",
    title: "طلا",
    durationDays: 365,
    price: 18000000,
    currency: "IRR",
    features: {
      maxListings: null,
      liftPerMonth: 15,
      tenderAuctionPerYear: 10,
      marketplaceBannerPerYear: 8,
      smsMarketing: false,
      chemaiCreditTier: "A_PLUS",
    },
    sortOrder: 4,
    isActive: true,
  },
];

async function run() {
  // برای اطمینان:
  console.log("MONGO_URL =", process.env.MONGO_URL);

  await connectToDB();

  for (const p of plans) {
    await Plan.updateOne({ code: p.code }, { $set: p }, { upsert: true });
  }

  console.log("✅ Plans seeded/updated successfully");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});