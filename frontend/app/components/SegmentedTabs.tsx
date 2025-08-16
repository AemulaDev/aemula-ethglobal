"use client";

import Link from "next/link";

export default function SegmentedTabs({ active }) {
  return (
    <div className="w-full rounded-2xl p-1 bg-zinc-800 shadow-md shadow-zinc-400">
      <div className="grid grid-cols-2 gap-1 text-md">
        <Link
          href="/write"
          className={`text-center py-2 rounded-l-xl rounded-r-sm ${
            active === "write" ? "bg-stone-50 text-zinc-800" : "bg-stone-300 text-zinc-400 hover:bg-stone-100"
          }`}
        >
          Write
        </Link>
        <Link
          href="/read"
          className={`text-center py-2 rounded-l-sm rounded-r-xl ${
            active === "read" ? "bg-stone-50 text-zinc-800" : "bg-stone-300 text-zinc-400 hover:bg-stone-100"
          }`}
        >
          Read
        </Link>
      </div>
    </div>
  );
};