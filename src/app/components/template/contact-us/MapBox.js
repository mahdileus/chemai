"use client"

import Link from "next/link";
import { FaMapPin } from "react-icons/fa";
import { IoMdCall, IoMdMail } from "react-icons/io";
import { PiTelegramLogo, PiInstagramLogo, PiYoutubeLogo } from "react-icons/pi"

const MapBox = () => {
  return (
    <div className="container font-yekan-bakh py-15 mt-16">
      <div className=" border-secondery rounded-2xl shadow-xl">
        <div className="py-10 text-center font-kalameh font-bold text-3xl  bg-secondery rounded-t-2xl">
          <h2 className="text-white">تماس با ما</h2>
        </div>

        {/* responsive layout */}
        <div className="flex flex-col bg-white lg:flex-row justify-between rounded-br-2xl rounded-bl-2xl ">
          {/* فرم تماس */}
          <div className="p-6 lg:p-10 w-full lg:w-[30%]">
            <h2 className="font-dana font-medium text-xl text-primary text-center py-2">
              منتطر پیام های شما هستیم
            </h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="نام و نام خانوادگی"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-[#3F72AF]"
              />
              <input
                type="text"
                placeholder="ایمیل"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-[#3F72AF]"
              />
              <textarea
                placeholder="پیام شما"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-[#3F72AF]"
              />
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 cursor-pointer rounded-lg hover:bg-secondery transition duration-200"
              >
                ارسال
              </button>
            </form>
            <div className="flex gap-4 mt-5 text-2xl justify-center text-[#112D4E]">
           <Link href="https://instagram.com/firouzeh.javaherian" target="_blank">
              <PiInstagramLogo className="hover:text-[#3F72AF] cursor-pointer" />
            </Link>

            <Link href="https://t.me/Poshtibani_javaherian" target="_blank">
              <PiTelegramLogo className="hover:text-[#3F72AF] cursor-pointer" />
            </Link>

            <Link href="https://www.youtube.com/@FirouzehJavaherian-gn3" target="_blank">
              <PiYoutubeLogo className="hover:text-[#3F72AF] cursor-pointer" />
            </Link>
            </div>
          </div>

          {/* اطلاعات تماس */}
          <div className="p-6 lg:p-10 w-full lg:w-[30%]">
            <h2 className="font-dana font-medium text-xl text-primary text-center py-2">
              باما در ارتباط باشید.
            </h2>
            <p className="text-center mb-4">
              لطفا پییشنهادات و انتقادات خودرا با ما درمیان بگزارید.
            </p>

            <div className="flex flex-col gap-8">
              {/* آدرس */}
              <div className="flex items-start gap-3 mt-6">
                <FaMapPin className="text-secondery w-6 h-6 mt-1" />
                <div>
                  <p className="font-bold text-primary text-lg">آدرس :</p>
                  <p className="text-gray-700 text-base leading-6">
                    تهران , ونک , کوچه هجدهم , پلاک 13  
                  </p>
                </div>
              </div>

              {/* شماره تماس */}
              <div className="flex items-start gap-3">
                <IoMdCall className="text-secondery w-6 h-6 mt-1" />
                <div>
                  <p className="font-bold text-primary text-lg">شماره تماس :</p>
                  <Link href="tel:09925349731">
                  <p className="text-gray-700 text-base">09001887188</p>
                  
                  </Link>
                </div>
              </div>

              {/* ایمیل */}
              <div className="flex items-start gap-3">
                <IoMdMail className="text-secondery w-6 h-6 mt-1" />
                <div>
                  <p className="font-bold text-primary text-lg">ایمیل :</p>
                  <p className="text-gray-700 text-base">chemaiifno@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* نقشه */}
          <div className="p-6 lg:p-10 w-full lg:w-[40%]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.209203700813!2d51.42058231525892!3d35.81534068016359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8e067dd3fce1a3%3A0xa5c3d646469b9612!2s18th%20St%2C%20Tajrish%2C%20Tehran%2C%20Tehran%20Province%2C%20Iran!5e0!3m2!1sen!2s!4v1680000000000"
              width="100%"
              height="100%"
              className="rounded-lg min-h-[300px]"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapBox;
