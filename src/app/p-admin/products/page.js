import ProductsTable from "@/app/components/template/p-admin/products/ProductsTable";
import Link from "next/link";

export default function AdminProductsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">مدیریت محصولات</h1>
          <p className="text-sm text-gray-500 mt-1">
            لیست محصولات، جستجو، فیلتر، ویرایش و حذف
          </p>
        </div>

        <Link
          href="/p-admin/products/new"
          className="px-4 py-2 rounded-xl bg-blue-600 text-white"
        >
          + افزودن محصول
        </Link>
      </div>

      <ProductsTable />
    </div>
  );
}