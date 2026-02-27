"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IoIosSend } from "react-icons/io";
import swal from "sweetalert";

function SendTicket() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [departments, setDepartments] = useState([]);
  const [departmentID, setDepartmentID] = useState(-1);
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getDepartments = async () => {
      try {
        const res = await fetch("/api/department");
        const data = await res.json();
        setDepartments(data.list || []);
      } catch (err) {
        console.error(err);
        swal("خطا در دریافت دپارتمان‌ها", "", "error");
      }
    };

    getDepartments();
  }, []);


  const sendTicket = async () => {
    if (!title || !body || departmentID === -1) {
      swal("لطفاً تمام فیلدها را تکمیل کنید", "", "warning");
      return;
    }

    setLoading(true);

    const ticket = { title, body, department: departmentID, priority };

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticket),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "ارسال تیکت موفق نبود");

      swal({
        title: "تیکت با موفقیت ثبت شد",
        icon: "success",
        buttons: "مشاهده تیکت‌ها",
      }).then(() => {
        location.replace("/p-user/tickets");
      });

      // reset
      setTitle("");
      setBody("");
      setDepartmentID(-1);
      setPriority("medium");

    } catch (err) {
      console.error(err);
      swal("خطا", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container bg-white mx-auto px-4 rounded-2xl shadow-md py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ارسال تیکت جدید</h1>
        <Link href="/p-user/tickets" className="text-blue-600 hover:underline text-sm">
          مشاهده همه تیکت‌ها
        </Link>
      </div>

      {/* دپارتمان */}
      <div className="mb-5">
        <label className="block text-gray-700 mb-2">دپارتمان:</label>
        <select
          value={departmentID}
          onChange={(e) => setDepartmentID(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
        >
          <option value={-1}>-- انتخاب دپارتمان --</option>
          {departments.map((dep) => (
            <option key={dep._id} value={dep._id}>
              {dep.title}  {/* یا dep.name اگر اسم فیلد name است */}
            </option>
          ))}

        </select>
      </div>

      {/* عنوان */}
      <div className="mb-5">
        <label className="block text-gray-700 mb-2">عنوان تیکت:</label>
        <input
          type="text"
          placeholder="مثلاً مشکل در پرداخت"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>

      {/* اولویت */}
      <div className="mb-5">
        <label className="block text-gray-700 mb-2">اولویت تیکت:</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
        >
          <option value="low">کم</option>
          <option value="medium">متوسط</option>
          <option value="high">زیاد</option>
        </select>
      </div>

      {/* متن پیام */}
      <div className="mb-5">
        <label className="block text-gray-700 mb-2">متن پیام:</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="w-full border border-gray-300 rounded-lg p-3"
          placeholder="متن کامل درخواست یا مشکل خود را وارد کنید..."
        ></textarea>
      </div>

      {/* ارسال */}
      <button
        onClick={sendTicket}
        disabled={loading}
        className={`flex items-center gap-2 px-6 py-2 rounded-lg transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90"
          }`}
      >
        <IoIosSend size={20} />
        {loading ? "در حال ارسال..." : "ارسال تیکت"}
      </button>
    </main>
  );
}

export default SendTicket;
