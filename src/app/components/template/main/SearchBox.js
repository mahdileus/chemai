"use client";

import { useState } from "react";

export default function SearchBox({ placeholder = "جستجو..." }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // اینجا می‌تونی ریدایرکت کنی یا API بزنی
    console.log("Search for:", query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto px-4"
    >
      <div className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="
            w-full
            border
            bg-white
            border-gray-300
            focus:border-primary
            focus:ring-2
            focus:ring-primary/30
            rounded-full
            py-3
            px-5
            transition
            duration-200
            outline-none
            text-gray-700
            placeholder-gray-400
          "
        />

        <button
          type="submit"
        >
          
        </button>
      </div>
    </form>
  );
}
