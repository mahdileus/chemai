"use client";

import { useState } from "react";
import { authTypes } from "@/utils/constants";
import Login from "@/app/components/template/login-register/Login";
import Register from "@/app/components/template/login-register/Register";
import Slider from "../components/template/login-register/Slider";
import ShapeTwo from "../components/template/shape/Shape";

export default function LoginRegister() {
  const [authType, setAuthType] = useState(authTypes.LOGIN);

  const showRegisterForm = () => setAuthType(authTypes.REGISTER);
  const showLoginForm = () => setAuthType(authTypes.LOGIN);

  return (
    <div className="min-h-screen w-full bg-[#e6f0ff] relative overflow-hidden font-yekan-bakh flex items-center justify-center">
      <ShapeTwo/>

      <div className="w-[95%] md:w-[80%] lg:w-[70%] border-primary z-30 bg-white rounded-3xl shadow-2xl overflow-hidden flex">

        {/* ستون راست - اسلایدر */}
        <div className="hidden md:flex w-1/2 bg-white p-6 items-center justify-center">
          <Slider/>
        </div>

        {/* ستون چپ - فرم */}
        <div className="w-full p-0 md:p-8 flex items-center justify-center bg-primary">
          {authType === authTypes.LOGIN ? (
            <Login showRegisterForm={showRegisterForm} />
          ) : (
            <Register showLoginForm={showLoginForm} />
          )}
        </div>

      </div>
    </div>
  );
}
