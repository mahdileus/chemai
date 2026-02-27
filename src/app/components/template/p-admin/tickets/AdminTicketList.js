"use client";
import Link from "next/link";

export default function AdminTicketList({ tickets }) {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">تیکت‌ها</h1>

      {tickets.map((t) => (
        <Link
          key={t._id}
          href={`/p-admin/tickets/${t._id}`}
          className="block border rounded-xl p-4 hover:shadow"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{t.title}</p>
              <p className="text-sm text-gray-500">
                {t.user?.name} — {t.department?.title}
              </p>
            </div>

            <div className="text-sm">
              <StatusBadge status={t.status} />
            </div>
          </div>
        </Link>
      ))}
    </main>
  );
}

function StatusBadge({ status }) {
  const map = {
    open: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    answered: "bg-green-100 text-green-700",
    closed: "bg-gray-200 text-gray-700",
  };

  return (
    <span className={`px-3 py-1 rounded-lg ${map[status]}`}>
      {status}
    </span>
  );
}
