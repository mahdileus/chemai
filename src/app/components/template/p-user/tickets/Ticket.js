import Link from "next/link";

const statusMap = {
  open: { label: "باز", color: "text-gray-500" },
  pending: { label: "در انتظار پاسخ", color: "text-orange-500" },
  answered: { label: "پاسخ داده شده", color: "text-green-600" },
  closed: { label: "بسته شده", color: "text-gray-400" },
};

const priorityMap = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-600",
};

const Ticket = ({
  _id,
  title,
  createdAt,
  department,
  status,
  priority = "medium",
  unreadCount = 0,
}) => {
  const st = statusMap[status] || statusMap.open;

  return (
    <Link
      href={`/p-user/tickets/answer/${_id}`}
      className="block border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

        {/* left */}
        <div>
          <p className="text-lg font-semibold text-gray-800 mb-1">
            {title}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-gray-500">
              {department?.name || "بدون دپارتمان"}
            </p>

            {/* priority */}
            <span className={`text-xs px-2 py-1 rounded ${priorityMap[priority]}`}>
              {priority}
            </span>

            {/* unread */}
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-600">
                {unreadCount} پیام جدید
              </span>
            )}
          </div>
        </div>

        {/* right */}
        <div className="text-right whitespace-nowrap">
          <p className="text-sm text-gray-500">
            {new Date(createdAt).toLocaleDateString("fa-IR")}
          </p>

          <p className={`text-sm mt-1 font-medium ${st.color}`}>
            {st.label}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default Ticket;
