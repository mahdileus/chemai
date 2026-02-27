export function HexIcon({ children }) {
  return (
    <div className="
      w-20 h-20
      flex items-center justify-center
      bg-white
      border-2 border-orange-400
      text-orange-500
      clip-hex
      hover:bg-orange-50
      hover:scale-105
      transition
      shadow-sm
    ">
      {children}
    </div>
  );
}
