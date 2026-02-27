export const dynamic = "force-dynamic";
import connectToDB from "@/configs/db";
import Footer from "./components/module/footer/Footer";
import Navbar from "./components/module/navbar/Navbar";

import { authUser } from "@/utils/auth-server";
import Herosection from "./components/template/main/Herosection";
import FlipBox from "./components/template/main/FlipBox";
import CommentBox from "./components/template/main/CommentBox";
import Plans from "./components/template/main/Plans";
;

export default async function Home() {
  await connectToDB();
  const user = await authUser();
  let userName = null;

  if (user && user.name) {
    userName = user.name;
  }


  return (
    <div className="font-yekan-bakh overflow-x-hidden">
      <Navbar isLogin={!!user}
        userName={userName}
      />
      <Herosection/>
      <Plans/>
      <FlipBox/>
      <CommentBox/>
      <Footer />
    </div>
  );
}
