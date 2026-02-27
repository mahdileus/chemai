import ListingForm from "@/app/components/template/p-user/listings/ListingForm";
import Link from "next/link";

export default async function EditListingPage({ params }) {
  const { id } = await params;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">ویرایش آگهی</h1>
          <p className="text-sm text-gray-500 mt-1">
            اطلاعات آگهی خود را ویرایش کنید.
          </p>
        </div>

        <Link href="/p-user/listings" className="px-4 py-2 border rounded-xl">
          آگهی‌های من
        </Link>
      </div>

      <ListingForm mode="edit" listingId={id} />
    </div>
  );
}