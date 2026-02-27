import Link from "next/link"
import { CiBookmark } from "react-icons/ci"
export default function ShopCategories(){
    return(
                    <div className=" w-full mt-10  container flex flex-col justify-center">

                <div className="relative grid md:grid-cols-6  grid-cols-2 lg:mt-10 lg:gap-10 gap-5">
                    <Link href="/products/category/cat" className="flex flex-col gap-2 items-center justify-center rounded-3xl ">
            <div className="flex items-center justify-center gap-2 text-black/85 pb-6">
                <div className="bg-blue-100 text-blue-600 p-2.5 shadow-xl"
                    style={{ clipPath: "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)" }}>
                    <CiBookmark size={32} />
                </div>
            </div>
                    </Link>

                    <Link href="/products/category/dog" className="flex  flex-col gap-2  items-center justify-center category_poster_item rounded-3xl ">
                        <img className=" object-cover w-[100px] h-[100px]" src="/icons/comestics.png" alt="" />
                        <span className="text-[16px] text-secondery font-bold"> آرایشی و بهداشتی و شوینده </span>
                    </Link>


                    <Link href="/products/category/birds" className="flex flex-col gap-2  items-center justify-center category_poster_item rounded-3xl ">
                        <img className="w-[100px] h-[100px] object-cover" src="/icons/esanse.png" alt="" />
                        <span className="text-[16px] text-secondery font-bold">اسانس و افزودنی های طبیعی</span>
                    </Link>


                    <Link href="/products/category/rabbits" className="flex flex-col gap-2  items-center justify-center category_poster_item rounded-3xl ">
                        <img className="w-[100px] h-[100px] object-cover" src="/images/rabbit.png" alt="" />
                        <span className="text-[16px] text-secondery font-bold">  رنگ و رزین و چسب </span>
                    </Link>

                    <Link href="/products/category/fish" className="flex flex-col gap-2  items-center justify-center category_poster_item rounded-3xl ">
                        <img className="w-[100px] h-[100px] object-cover" src="/images/clown-fish.png" alt="" />
                        <span className="text-[16px] text-secondery font-bold">  چرم و نساجی </span>
                    </Link>

                    <Link href="/products/category/crawler" className="flex flex-col gap-2  items-center justify-center category_poster_item rounded-3xl ">
                        <img className="w-[100px] h-[100px] object-cover" src="/images/aligator.png" alt="" />
                        <span className="text-[16px] text-secondery font-bold">پلیمر و پلاستیک </span>
                    </Link>
                    <Link href="/products/category/crawler" className="flex flex-col gap-2  items-center justify-center category_poster_item rounded-3xl ">
                        <img className="w-[100px] h-[100px] object-cover" src="/images/aligator.png" alt="" />
                        <span className="text-[16px] text-secondery font-bold">چاپ و بسته بندی</span>
                    </Link>
                    <Link href="/products/category/crawler" className="flex flex-col gap-2  items-center justify-center category_poster_item rounded-3xl ">
                        <img className="w-[100px] h-[100px] object-cover" src="/images/aligator.png" alt="" />
                        <span className="text-[16px] text-secondery font-bold">کشاورزی و باغبانی</span>
                    </Link>
                    <Link href="/products/category/crawler" className="flex flex-col gap-2  items-center justify-center category_poster_item rounded-3xl ">
                        <img className="w-[100px] h-[100px] object-cover" src="/images/aligator.png" alt="" />
                        <span className="text-[16px] text-secondery font-bold">نفت و گاز و پتروشیمی</span>
                    </Link>
                    <Link href="/products/category/crawler" className="flex flex-col gap-2  items-center justify-center category_poster_item rounded-3xl ">
                        <img className="w-[100px] h-[100px] object-cover" src="/images/aligator.png" alt="" />
                        <span className="text-[16px] text-secondery font-bold">صنعت ساختمان</span>
                    </Link>
                    <Link href="/products/category/crawler" className="flex flex-col gap-2  items-center justify-center category_poster_item rounded-3xl ">
                        <img className="w-[100px] h-[100px] object-cover" src="/images/aligator.png" alt="" />
                        <span className="text-[16px] text-secondery font-bold">دارویی ، پزشکی و سلامت </span>
                    </Link>
                    <Link href="/products/category/crawler" className="flex flex-col gap-2  items-center justify-center category_poster_item rounded-3xl ">
                        <img className="w-[100px] h-[100px] object-cover" src="/images/aligator.png" alt="" />
                        <span className="text-[16px] text-secondery font-bold">مواد شیمیایی آزمایشگاهی</span>
                    </Link>
                </div>

            </div>
    )
}