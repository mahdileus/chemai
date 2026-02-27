export default function StatsStrip() {
  const items = [
    { k: "شفافیت", v: "مقایسه قیمت و شرایط خرید", tone: "blue" },
    { k: "سرعت", v: "ساده‌سازی روند خرید و فروش", tone: "orange" },
    { k: "اعتماد", v: "تعامل حرفه‌ای تأمین‌کننده و خریدار", tone: "blue" },
    { k: "لجستیک", v: "مدیریت یکپارچه ارسال و تحویل", tone: "orange" },
  ];

  return (
    <section className=" py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {items.map((x) => (
            <div
              key={x.k}
              className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-md p-5 shadow-sm"
            >
              <div
                className={`text-sm font-semibold ${
                  x.tone === "blue" ? "text-blue-700" : "text-orange-700"
                }`}
              >
                {x.k}
              </div>
              <div className="mt-2 text-slate-700 text-sm leading-7">{x.v}</div>
              <div
                className={`mt-4 h-1 w-14 rounded-full ${
                  x.tone === "blue" ? "bg-blue-500" : "bg-orange-500"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}