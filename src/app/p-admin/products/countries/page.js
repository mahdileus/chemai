import ReferenceCrudPage from "@/app/components/template/p-admin/products/ReferenceCrudPage";

export const dynamic = "force-dynamic";

export default function AdminCountriesPage() {
  return (
    <ReferenceCrudPage
      title="کشور"
      endpoint="/api/admin/countries"
      titleLabel="نام کشور"
      codeLabel="کد کشور"
    />
  );
}