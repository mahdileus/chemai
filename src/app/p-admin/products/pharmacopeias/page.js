import ReferenceCrudPage from "@/app/components/template/p-admin/products/ReferenceCrudPage";

export const dynamic = "force-dynamic";

export default function AdminPharmacopeiasPage() {
  return (
    <ReferenceCrudPage
      title="فارماکوپه"
      endpoint="/api/admin/pharmacopeias"
      titleLabel="عنوان فارماکوپه"
      codeLabel="کد فارماکوپه"
    />
  );
}