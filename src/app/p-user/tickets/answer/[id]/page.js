import Link from "next/link";
import connectToDB from "@/configs/db";
import TicketModel from "@/models/Ticket";
import { authUser } from "@/utils/auth-server";
import TicketThread from "@/app/components/template/p-user/tickets/TicketThread";

const page = async ({ params }) => {
  const user = await authUser();
  if (!user) return <div>ابتدا وارد شوید</div>;

  const { id } = await params;

  await connectToDB();

  const ticket = await TicketModel.findOne({
    _id: id,
    user: user._id,
  })
    .populate("user", "name role")
    .populate("replies.user", "name role")
    .lean();

  if (!ticket) return <div>تیکت پیدا نشد</div>;

  return <TicketThread ticket={JSON.parse(JSON.stringify(ticket))} />;
};

export default page;
