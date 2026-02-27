import SpecialSells from "./SpacialSells";
import TopSells from "./TopSells";

export default function Special() {
  return (
    <div className="pt-20 container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* سمت چپ */}
        <div className="w-full">
          <SpecialSells />
        </div>

        {/* سمت راست */}
        <div className="w-full">
          <TopSells />
        </div>
      </div>
    </div>
  );
}
