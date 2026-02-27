"use client";

import { useState } from "react";
import Answer from "./Answer";

export default function TicketThread({ ticket }) {
  const [message, setMessage] = useState("");

  const sendReply = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/tickets/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticketID: ticket._id,
        message,
      }),
    });

    if (res.ok) {
      location.reload();
    }
  };

  return (
    <main className="container">

      {/* تیکت اصلی */}
      <Answer
        type="user"
        title={ticket.title}
        body={ticket.body}
        createdAt={ticket.createdAt}
        user={ticket.user}
      />

      {/* replies */}
      {ticket.replies.map((r) => (
        <Answer
          key={r._id}
          type={r.user.role === "admin" ? "admin" : "user"}
          body={r.message}
          createdAt={r.createdAt}
          user={r.user}
        />
      ))}

      {/* فرم پاسخ */}
      {ticket.status !== "closed" && (
        <form onSubmit={sendReply} className="mt-6 space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded-lg p-3"
            rows={4}
            placeholder="پاسخ خود را بنویسید..."
          />

          <button className="bg-primary text-white px-4 py-2 rounded-lg">
            ارسال پاسخ
          </button>
        </form>
      )}
    </main>
  );
}
