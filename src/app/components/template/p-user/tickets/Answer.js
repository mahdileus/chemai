import Image from "next/image";

const Answer = ({ isAdmin, body, createdAt, user }) => {
  const isUser = !isAdmin;

  return (
    <div className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          w-1/2 rounded-2xl p-4 shadow-md
          ${isUser ? "bg-secondery text-white" : "bg-primary text-white"}
        `}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-2 gap-4">
          <div className="flex items-center gap-3">
            
            {/* avatar */}
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                {user?.name?.[0] || "?"}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold">
                {user?.name || "—"}
              </p>
              <span className="text-xs opacity-80">
                {isUser ? "کاربر" : "پشتیبانی"}
              </span>
            </div>
          </div>

          {/* date */}
          <p className="text-xs opacity-80 whitespace-nowrap">
            {new Date(createdAt).toLocaleString("fa-IR")}
          </p>
        </div>

        {/* body */}
        <div className="bg-white text-gray-700 p-3 rounded-xl leading-relaxed text-sm">
          {body}
        </div>
      </div>
    </div>
  );
};

export default Answer;
