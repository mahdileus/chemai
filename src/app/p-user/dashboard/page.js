export const dynamic = "force-dynamic";
import UserInfoBox from "@/app/components/template/p-user/dashboard/UserInfoBox";
import connectToDB from "@/configs/db";
import { authUser } from "@/utils/auth-server";
import Product from "@/app/components/template/p-user/my-product/Product";




export default async function Dashboard() {
  await connectToDB();
  const user = await authUser();

  const safeUser = user ? {
    _id: String(user._id),
    phone: user.phone || "",
    email: user.email || "",
    role: user.role || "USER",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    accountType: user.accountType || "REAL",
    nationalCode: user.nationalCode || "",
    chemaiCode: user.chemaiCode || "",
    iban: user.iban || "",
    avatar: user.avatar || "",
    legalInfo: user.legalInfo || {},
  } : null;

  <UserInfoBox user={safeUser} />

  return (
    <section className="container md:mt-14 mt-2 ">
      <h2 className="text-gray-700 text-sm md:text-base text-center mb-10 bg-green-100 rounded-full p-2">لطفا برای اضافه کردن اطلاعات مثل شماره شبا روی دکمه ویرایش اطلاعات کلیک کنید . </h2>
      <UserInfoBox user={JSON.parse(JSON.stringify(user))} />
      <div className="flex items-center justify-between gap-10 pt-20">

        <div className="md:w-1/2 w-full">
          <div className="flex justify-between items-center gap-4 mb-8">
            <h2 className="md:text-xl text-sm font-semibold text-primary">
              محصولات من
            </h2>

            <button className="bg-primary text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all md:py-2 md:px-5 px-2.5 py-1 flex justify-center items-center cursor-pointer select-none">
              مشاهده همه
            </button>
          </div>
          <Product />
          <Product />
          <Product />
        </div>
        <div className="md:flex items-center justify-center md:w-1/2 w-full hidden">
          <h2>          تیکتی هنوز ثبت نشده است
          </h2>
        </div>
      </div>
    </section>
  );
}
