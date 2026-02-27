
import connectToDB from "@/configs/db";

import { authUser } from "@/utils/auth-server";
import Shape from "../components/template/shape/Shape";
import ShopNavbar from "../components/module/navbar/ShopNavbar";
import Footer from "../components/module/footer/Footer";
import MapBox from "../components/template/contact-us/MapBox";


const ContactUs = async () => {
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
      <MapBox/>
    
    <Footer/>
    </div>
  );
};

export default ContactUs;