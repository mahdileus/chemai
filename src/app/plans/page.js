export const dynamic = "force-dynamic";

import connectToDB from "@/configs/db";
import Footer from "../components/module/footer/Footer";
import { authUser } from "@/utils/auth-server";
import ShopNavbar from "../components/module/navbar/ShopNavbar";
import Shape from "../components/template/shape/Shape";
import Plans from "../components/template/main/Plans";

export default async function Plan() {
  await connectToDB();
  const user = await authUser();
  let userName = null;

  if (user && user.name) {
    userName = user.name;
  }


  return (
    <div className="font-yekan-bakh relative overflow-x-hidden">
      <Shape/>
      <ShopNavbar isLogin={!!user}
        userName={userName}
      />
      <Plans/>
      <Footer/>
    </div>
  );
}
