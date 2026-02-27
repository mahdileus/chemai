import MyListingsTable from "@/app/components/template/p-user/listings/MylistingsTable";
import Link from "next/link";

export default function MyListingsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">آگهی‌های من</h1>
          <p className="text-sm text-gray-500 mt-1">
            مدیریت آگهی‌ها، وضعیت، ویرایش و آرشیو
          </p>
        </div>

        <Link
          href="/p-user/listings/new"
          className="px-4 py-2 rounded-xl bg-blue-600 text-white"
        >
          + ثبت آگهی جدید
        </Link>
      </div>

      <MyListingsTable />
    </div>
  );
}