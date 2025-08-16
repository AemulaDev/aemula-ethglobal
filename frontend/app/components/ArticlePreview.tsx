"use client";

import Link from "next/link";
import { formatTimestamp } from "@/lib/format";

export default function ArticlePreview({ article }) {
  const snippet = article.body.length > 100 ? article.body.slice(0, 100) + "…" : article.body;

  return (
    <Link
      href={`/article/${article.cid}`}
      className="block rounded-3xl border border-neutral-300 p-4 hover:bg-neutral-50 transition"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold">{article.title}</h2>
        <time className="text-xs text-neutral-500">{formatTimestamp(article.timestamp)}</time>
      </div>
      <p className="text-sm text-neutral-700 mt-1">{snippet}</p>
      <div className="text-xs text-neutral-500 mt-1">{article.author}</div>
    </Link>
  );
};