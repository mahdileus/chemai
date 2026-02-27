export const dynamic = 'force-dynamic';

import connectToDB from "@/configs/db";
import { authUser } from "@/utils/auth-server";
import TicketModel from "@/models/Ticket";
import Tickets from "@/app/components/template/p-user/tickets/Tickets";
import "@/models/Department";


const page = async () => {
  await connectToDB();

  const user = await authUser();
  if (!user) return null;

  const tickets = await TicketModel.find({ user: user._id })
    .populate("department", "name") // یا title اگر در DB title هست
    .sort({ lastReplyAt: -1, createdAt: -1 })
    .lean(); // برای serialize راحت‌تر

  return (
    <Tickets tickets={JSON.parse(JSON.stringify(tickets))} />
  );
};

export default page;
