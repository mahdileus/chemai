"use client";

import { PiFactoryThin } from "react-icons/pi";
import { CiSearch } from "react-icons/ci";
import { CiDeliveryTruck } from "react-icons/ci";
import { CiShop } from "react-icons/ci";
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


export default function FlipBox() {
    return (
        <div className="py-16 px-4 container font-yekan-bakh">
            <h2 className="text-4xl font-bold text-primary text-center">
                چرا <strong className="text-orange-500">کمای ؟</strong>
            </h2>
            <p className="text-center text-gray-700 mb-8 mt-3 ">تمام فرایند خرید مواد شیمیایی، از استعلام قیمت تا تحویل، در یک پلتفرم امن و شفاف</p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {techs.map((tech, idx) => (
                    <div key={idx} className="group perspective">
                        <div className="relative w-full h-80 text-center transition-transform duration-500 transform-style-preserve-3d group-hover:rotate-y-180">

                            {/* Front */}
                            <div className="absolute w-full h-full bg-white rounded-xl shadow-lg flex flex-col items-center justify-center backface-hidden p-6">
                                {tech.icon}
                                <h3 className="text-xl font-semibold mt-4 mb-2">{tech.name}</h3>
                                <p className="text-gray-600">{tech.description}</p>

                            </div>

                            {/* Back */}
                            <div className="absolute w-full h-full bg-linear-to-br from-primary to-blue-600 text-white rounded-xl flex flex-col items-center justify-center rotate-y-180 backface-hidden p-6">
                                <h3 className="text-xl font-semibold mb-2">{tech.name}</h3>
                                <p className="text-sm text-justify">{tech.backDesc}</p>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            {/* CSS Tailwind اضافی برای flip */}
            <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
        </div>
    );
}
