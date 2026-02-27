import ReferenceCrudPage from "@/app/components/template/p-admin/products/ReferenceCrudPage";

export const dynamic = "force-dynamic";

export default function AdminGradesPage() {
  return (
    <ReferenceCrudPage
      title="گرید"
      endpoint="/api/admin/grades"
      titleLabel="عنوان گرید"
      codeLabel="کد گرید"
    />
  );
}