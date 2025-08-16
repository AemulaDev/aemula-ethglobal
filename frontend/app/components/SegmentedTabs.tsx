"use client";

import Link from "next/link";

export default function SegmentedTabs({ active }) {
  return (
    <div className="w-full rounded-2xl border border-neutral-300 p-1 bg-neutral-100">
      <div className="grid grid-cols-2 gap-1">
        <Link
          href="/write"
          className={`text-center py-2 rounded-xl border border-neutral-300 ${
            active === "write" ? "bg-white shadow-sm" : "bg-neutral-200 hover:bg-neutral-50"
          }`}
        >
          Write
        </Link>
        <Link
          href="/read"
          className={`text-center py-2 rounded-xl border border-neutral-300 ${
            active === "read" ? "bg-white shadow-sm" : "bg-neutral-200 hover:bg-neutral-50"
          }`}
        >
          Read
        </Link>
      </div>
    </div>
  );
};