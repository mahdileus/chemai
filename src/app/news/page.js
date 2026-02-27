export const dynamic = "force-dynamic";

import connectToDB from "@/configs/db";
import Footer from "../components/module/footer/Footer";
import { authUser } from "@/utils/auth-server";
import ShopNavbar from "../components/module/navbar/ShopNavbar";
import Shape from "../components/template/shape/Shape";
import NewsComingSoon from "../components/template/main/NewsComingSoon";
;

export default async function News() {
    await connectToDB();
    const user = await authUser();
    let userName = null;

    if (user && user.name) {
        userName = user.name;
    }


    return (

        <div className="h-screen overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 font-yekan-bakh text-white">
            {/* glow background accents */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
            </div>
            <NewsComingSoon />
        </div>
    );
}
