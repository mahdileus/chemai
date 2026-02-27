export default function AboutHero() {
  return (
    <section className="relative py-14">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-md shadow-sm p-6 md:p-10">
          {/* accents */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-xs text-slate-600">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              درباره کِمای (ChemAI)
            </div>

            <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-slate-900">
              بازارگاه تخصصی مواد شیمیایی با تجربه خرید و فروش شفاف و بدون دردسر
            </h2>

            <p className="mt-3 text-justify text-slate-600 leading-8">
               کِمای اولین و بزرگ‌ترین بازارگاه مواد اولیه و جانبی در زنجیره تأمین مواد شیمیایی ایران است.
              ما یک پلتفرم B2B هستیم که با تعامل محتوایی، دغدغه‌های فروش تأمین‌کنندگان و تولیدکنندگان را کم می‌کنیم
              و خرید را برای مشتریان ساده‌تر و سریع‌تر می‌سازیم؛ از مقایسه شفاف تأمین‌کنندگان تا لجستیک یکپارچه.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { t: "شفافیت قیمت", c: "bg-blue-50 text-blue-700 border-blue-200" },
                { t: "مقایسه تامین‌کنندگان", c: "bg-orange-50 text-orange-700 border-orange-200" },
                { t: "لجستیک یکپارچه", c: "bg-blue-50 text-blue-700 border-blue-200" },
                { t: "فرایند خرید امن", c: "bg-orange-50 text-orange-700 border-orange-200" },
              ].map((x) => (
                <span
                  key={x.t}
                  className={`text-sm px-3 py-1 rounded-full border ${x.c}`}
                >
                  {x.t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}