"use client";

import Link from "next/link";

export default function SegmentedTabs({ active }) {
  return (
    <div className="w-full rounded-lg p-1 bg-zinc-800 shadow-md shadow-zinc-400">
      <div className="grid grid-cols-2 gap-1 text-md">
        <Link
          href="/write"
          className={`text-center py-2 rounded-md ${
            active === "write" ? "bg-stone-50 shadow-sm text-zinc-800" : "bg-stone-200 text-zinc-400 hover:bg-stone-100"
          }`}
        >
          Write
        </Link>
        <Link
          href="/read"
          className={`text-center py-2 rounded-md border border-neutral-300 ${
            active === "read" ? "bg-stone-50 shadow-sm text-zinc-800" : "bg-stone-200 text-zinc-400 hover:bg-stone-100"
          }`}
        >
          Read
        </Link>
      </div>
    </div>
  );
};