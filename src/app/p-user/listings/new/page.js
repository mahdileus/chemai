import ListingForm from "@/app/components/template/p-user/listings/ListingForm";
import Link from "next/link";

export default function NewListingPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">ثبت آگهی جدید</h1>
          <p className="text-sm text-gray-500 mt-1">
            محصول را از کاتالوگ انتخاب کنید و اطلاعات فروش خود را وارد کنید.
          </p>
        </div>

        <Link href="/p-user/listings" className="px-4 py-2 border rounded-xl">
          آگهی‌های من
        </Link>
      </div>

      <ListingForm />
    </div>
  );
}