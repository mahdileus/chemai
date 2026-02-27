import FinancialAffair from "@/app/components/template/p-user/financial-affairs/FinancialAffairs";

export default function FinancialAffairs() {
  return (
    <main className="md:p-5 p-0">
        <h2 className="font-xl font-bold text-primary pb-10">تراکنش ها و سوابق</h2>
                    <div className="bg-[#e6f0ff] rounded-xl overflow-hidden  p-4 mb-4 hidden md:flex items-center justify-around text-[#e6f0ff]">
                <h3 className="text-gray-700">کد پیگیری</h3>
                <h4 className="text-gray-700"> تاریخ </h4>
                <h4 className="text-gray-700"> ساعت</h4>
                <h4 className="text-gray-700"> وضعیت پرداخت </h4>
                <div className=" text-gray-700">
                    قیمت 
                </div>
            </div>
      <FinancialAffair />
    </main>
  );
}
