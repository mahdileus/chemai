// app/products/[slug]/page.jsx
import Footer from "@/app/components/module/footer/Footer";
import ProductHeader from "@/app/components/template/product/ProductHeader";
import ProductTabs from "@/app/components/template/product/ProductTabs";
import ShapeTwo from "@/app/components/template/shape/Shape";
import ShopNavbar from "../components/module/navbar/ShopNavbar";



export const dynamic = "force-dynamic";

export default async function Product({  }) {


  return (
    <div className="font-yekan-bakh relative overflow-hidden">
      <ShapeTwo />
      <ShopNavbar />

      <div className="container mx-auto px-4 py-10">
        {/* هدر محصول (گالری + اطلاعات) */}
        <ProductHeader  />
        {/* تب‌ها */}
        <ProductTabs
        />
      </div>
      <Footer />
    </div>
  );
}