import Plan from "@/models/Plan";
import Subscription from "@/models/Subscription";

export async function createDefaultSubscription(userId) {
  const existing = await Subscription.findOne({ user: userId, status: "ACTIVE" }).select("_id");
  if (existing) return existing;

  const plan = await Plan.findOne({ code: "HYDROGEN", isActive: true }).select("_id code durationDays");
  if (!plan) throw new Error("Default plan (HYDROGEN) not found. Seed plans first.");

  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + (plan.durationDays || 365));

  return Subscription.create({
    user: userId,
    plan: plan._id,
    planCode: plan.code,
    status: "ACTIVE",
    startsAt,
    endsAt,
    usage: {
      liftUsed: 0,
      liftMonthKey: "",
      tenderAuctionUsed: 0,
      tenderYear: 0,
      bannersUsed: 0,
      bannerYear: 0,
    },
  });
}