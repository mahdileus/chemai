import ReferenceCrudPage from "@/app/components/template/p-admin/products/ReferenceCrudPage";

export const dynamic = "force-dynamic";

export default function AdminFormsPage() {
  return (
    <ReferenceCrudPage
      title="فرم"
      endpoint="/api/admin/forms"
      titleLabel="عنوان فرم"
      codeLabel="کد فرم"
    />
  );
}