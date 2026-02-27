import Shape from "../components/template/shape/Shape";
import { PiFactoryThin } from "react-icons/pi";
import { CiSearch } from "react-icons/ci";
import { CiDeliveryTruck } from "react-icons/ci";
import { CiShop } from "react-icons/ci";
import AboutHero from "../components/template/about-us/AboutHero";
import StatsStrip from "../components/template/about-us/StatsStrip";
import FlipServices from "../components/template/about-us/FlipServices";
import ShopNavbar from "../components/module/navbar/ShopNavbar";
import Footer from "../components/module/footer/Footer";
import connectToDB from "@/configs/db";
import { authUser } from "@/utils/auth-server";
import FAQ from "../components/template/about-us/FAQ";



export default async function Aboutus() {

  const techs = [
    {
      name: "بازارگاه تخصصی شیمیایی",
      icon: <CiShop className="w-12 h-12 text-primary" />,
      description: "کمای اولین و بزرگ‌ترین بازارگاه مواد اولیه و جانبی در زنجیره تأمین مواد شیمیایی ایران است.",
      backDesc: `بازارگاه تخصصی شیمیایی کما به شرکت‌ها امکان می‌دهد تا مواد اولیه و جانبی خود را با بهترین قیمت و تضمین کیفیت تهیه کنند. تمام فرایند خرید، از استعلام قیمت تا سفارش و تحویل، در یک پلتفرم امن و متمرکز انجام می‌شود. این سرویس به تأمین‌کنندگان و خریداران اجازه می‌دهد در محیطی شفاف و حرفه‌ای تعامل کنند و زمان و هزینه را به حداقل برسانند.`
    },
    {
      name: "پلتفرم B2B تعاملی",
      icon: <PiFactoryThin className="w-12 h-12 text-secondery" />,
      description: "با رویکرد محتوایی، دغدغه‌های فروش تأمین‌کنندگان و تولیدکنندگان را کم می‌کند و خرید را برای مشتریان ساده‌تر می‌سازد.",
      backDesc: `پلتفرم B2B تعاملی ما تجربه‌ای روان و سریع برای تأمین‌کنندگان و مشتریان فراهم می‌کند. از طریق ابزارهای محتوایی و گزارش‌های تعاملی، فروشندگان می‌توانند بازار هدف خود را بهتر بشناسند و مشتریان با کمترین تلاش، بهترین پیشنهادها را پیدا کنند. این تعاملات باعث افزایش اعتماد، شفافیت و سرعت در تصمیم‌گیری‌های تجاری می‌شود.`
    },
    {
      name: "لجستیک بدون دردسر",
      icon: <CiDeliveryTruck className="w-12 h-12 text-primary" />,
      description: "یکی از اصلی‌ترین مشکلات بازار یعنی حمل‌ونقل و هماهنگی‌های لجستیکی را برای خریدار و فروشنده تا حد زیادی حذف می‌کند.",
      backDesc: `با سیستم لجستیک یکپارچه، سفارش‌ها به صورت اتوماتیک برنامه‌ریزی و مدیریت می‌شوند و مراحل ارسال و تحویل بدون نیاز به پیگیری مداوم مشتری یا فروشنده انجام می‌شود. این سرویس باعث کاهش خطاهای لجستیکی، صرفه‌جویی در زمان و کاهش هزینه‌های حمل‌ونقل می‌شود و تجربه خرید و فروش را برای همه طرفین ساده و مطمئن می‌کند.`
    },
    {
      name: "مقایسه شفاف تامین‌ کنندگان",
      icon: <CiSearch className="w-12 h-12 text-secondery" />,
      description: "امکان مقایسه قیمت، شرایط خرید و کیفیت محصول بین تأمین‌کنندگان مختلف را در اختیار خریداران قرار می‌دهد.",
      backDesc: `این ویژگی به خریداران اجازه می‌دهد تا بدون نیاز به تماس‌های متعدد، قیمت‌ها، شرایط خرید و کیفیت محصولات مختلف تأمین‌کنندگان را در یک نگاه مقایسه کنند. ابزارهای تحلیلی و رتبه‌بندی تأمین‌کنندگان باعث می‌شود تصمیم‌گیری سریع، هوشمندانه و با کمترین ریسک انجام شود و اعتماد به همکاری‌های تجاری افزایش یابد.`
    },
  ];
  await connectToDB();
  const user = await authUser();
  let userName = null;

  if (user && user.name) {
    userName = user.name;
  }

  return (
    <div className="font-yekan-bakh relative overflow-hidden">
      <Shape />
      <ShopNavbar isLogin={!!user}
        userName={userName}
      />
      <AboutHero />
      <StatsStrip />
      <FlipServices techs={techs} />
      <FAQ/>
      <Footer />
    </div>

  )
}