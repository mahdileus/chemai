export default function AdvancedSearch() {
  return (
    <div className="w-full border border-gray-200 rounded-2xl shadow p-4">

      <div className="flex gap-3 overflow-x-auto pb-2">

        <select className="filter-pill">
          <option>گرید</option>
        </select>

        <select className="filter-pill">
          <option>دسته‌بندی</option>
        </select>

        <select className="filter-pill">
          <option>بسته‌بندی</option>
        </select>

        <select className="filter-pill">
          <option>کشور سازنده</option>
        </select>

        <select className="filter-pill">
          <option>برند</option>
        </select>

        <select className="filter-pill">
          <option>فارماکوپه</option>
        </select>


      </div>
    </div>
  );
}
