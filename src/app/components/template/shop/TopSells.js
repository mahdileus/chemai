import ProductCard from "../../module/products/ProductCard";
import { CiBookmark } from "react-icons/ci";
export default function TopSells() {
    return (
        <div>
            <div className="flex items-center justify-center gap-2 text-black/85 pb-6">
                <div className="bg-blue-100 text-blue-600 p-2.5 shadow-xl"
                    style={{ clipPath: "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)" }}>
                    <CiBookmark size={32} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold font-kalameh">پرفروش ها</h2>
            </div>
            <div className="h-[600px] w-full overflow-y-auto border border-gray-200 p-4 space-y-4 rounded-2xl">
                {/* سه کارت اولیه */}
                <ProductCard />
                <ProductCard />
                <ProductCard />

                {/* بقیه کارت‌ها هم با اسکرول پایین قابل مشاهده */}
                <ProductCard />
                <ProductCard />
                <ProductCard />
            </div>
        </div>
    );
}
