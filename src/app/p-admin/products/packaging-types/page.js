import ReferenceCrudPage from "@/app/components/template/p-admin/products/ReferenceCrudPage";

export const dynamic = "force-dynamic";

export default function AdminPackagingTypesPage() {
  return (
    <ReferenceCrudPage
      title="نوع بسته‌بندی"
      endpoint="/api/admin/packaging-types"
      titleLabel="عنوان بسته‌بندی"
      codeLabel="کد بسته‌بندی"
    />
  );
}