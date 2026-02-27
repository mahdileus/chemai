"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/app/components/template/p-admin/products/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function fetchProduct() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/products/${productId}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "خطا در دریافت محصول");

      setProduct(data?.product || null);
    } catch (err) {
      setError(err.message || "خطا در دریافت محصول");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white border rounded-2xl p-6 text-sm text-gray-600">
        در حال دریافت اطلاعات محصول...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
        <Link href="/p-admin/products" className="inline-block px-4 py-2 border rounded-xl">
          بازگشت به لیست
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-3">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-4">
          محصول پیدا نشد.
        </div>
        <Link href="/p-admin/products" className="inline-block px-4 py-2 border rounded-xl">
          بازگشت به لیست
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">ویرایش محصول</h1>
          <p className="text-sm text-gray-500 mt-1">{product.title}</p>
        </div>

        <Link href="/p-admin/products" className="px-4 py-2 border rounded-xl">
          بازگشت
        </Link>
      </div>

      <ProductForm
        mode="edit"
        initialData={product}
        productId={productId}
        onSuccess={() => {
          // بعد از ذخیره، دوباره محصول را بگیر که فرم sync بماند
          fetchProduct();
          // اگر خواستی برگرده لیست:
          // router.push("/p-admin/products");
        }}
      />
    </div>
  );
}