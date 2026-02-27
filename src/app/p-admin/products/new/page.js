import ProductForm from "@/app/components/template/p-admin/products/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">افزودن محصول جدید</h1>
        <p className="text-sm text-gray-500 mt-1">
          اطلاعات محصول را وارد کنید، تصاویر را آپلود کنید و محصول را ثبت کنید.
        </p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}