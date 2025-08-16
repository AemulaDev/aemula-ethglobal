"use client";

import Link from "next/link";
import { formatTimestamp } from "@/lib/format";

export default function ArticlePreview({ article }) {
  const snippet = article.body.length > 100 ? article.body.slice(0, 100) + "…" : article.body;

  return (
    <Link
      href={`/article/${article.cid}`}
      className="block p-4 bg-stone-50 rounded-xl border border-stone-200 shadow-md shadow-stone-300 hover:bg-stone-100 transition"
    >
      <div className="flex items-baseline justify-between gap-4 text-zinc-800">
        <div className="text-xl font-semibold">{article.title}</div>
        <time className="text-xs text-zinc-400">{formatTimestamp(article.timestamp)}</time>
      </div>
      <div className="text-sm mt-1 text-zinc-800">{snippet}</div>
      <div className="text-xs text-zinc-400 mt-2">{article.author}</div>
    </Link>
  );
};