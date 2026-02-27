import connectToDB from "@/configs/db";
import { authUser } from "@/utils/auth-server";
import Ticket from "@/models/Ticket";
import "@/models/User";
import "@/models/Department";
import AdminTicketList from "@/app/components/template/p-admin/tickets/AdminTicketList";

export default async function Page() {
  await connectToDB();

  const user = await authUser();
  if (!user || user.role !== "admin") {
    return <div>دسترسی ندارید</div>;
  }

  const tickets = await Ticket.find({})
    .populate("user", "name")
    .populate("department", "title")
    .sort({ lastReplyAt: -1 })
    .lean();

  return (
    <AdminTicketList tickets={JSON.parse(JSON.stringify(tickets))} />
  );
}
