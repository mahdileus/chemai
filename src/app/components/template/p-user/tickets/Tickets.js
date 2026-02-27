"use client";
import Link from "next/link";
import Ticket from "./Ticket";

function Tickets({ tickets = [], loading = false }) {
  return (
    <main className="p-4 sm:p-6 md:p-10">

      {/* header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          همه تیکت‌ها ({tickets.length})
        </h1>

        <Link
          href="/p-user/tickets/sendticket"
          className="bg-primary text-white px-5 py-2 rounded-xl hover:bg-primary/90 transition"
        >
          ارسال تیکت جدید
        </Link>
      </div>

      {/* loading */}
      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* empty */}
      {!loading && tickets.length === 0 && (
        <div className="text-center mt-16 text-gray-600">
          <p className="text-lg">تیکتی وجود ندارد</p>
        </div>
      )}

      {/* list */}
      {!loading && tickets.length > 0 && (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <Ticket key={ticket._id} {...ticket} />
          ))}
        </div>
      )}

    </main>
  );
}

export default Tickets;
