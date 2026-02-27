export const dynamic = "force-dynamic";


import Categories from "../components/template/main/Categories";
import connectToDB from "@/configs/db";
import Footer from "../components/module/footer/Footer";
import { authUser } from "@/utils/auth-server";
import Herosection from "../components/template/shop/Herosection";
import ShopNavbar from "../components/module/navbar/ShopNavbar";
import LatestProduct from "../components/template/main/LatestProducts";
import Special from "../components/template/shop/Special";
import Shape from "../components/template/shape/Shape";
;

export default async function Home() {
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
      <Herosection />
      <Categories />
      <Special/>
      <LatestProduct />
      <Footer />
    </div>
  );
}
