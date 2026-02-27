import ReferenceCrudPage from "@/app/components/template/p-admin/products/ReferenceCrudPage";

export const dynamic = "force-dynamic";

export default function AdminManufacturersPage() {
  return (
    <ReferenceCrudPage
      title="شرکت سازنده"
      endpoint="/api/admin/manufacturer"
      titleLabel="نام شرکت"
      codeLabel="کد شرکت"
    />
  );
}