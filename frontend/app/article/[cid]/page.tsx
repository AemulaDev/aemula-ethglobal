"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatTimestamp } from "@/lib/format";
import { JellyLoader } from "../../components/JellyLoader";
import { IoMdClose } from "react-icons/io";

const GATEWAY = "aemula-ethglobal.mypinata.cloud";

type ArticleFile = {
  title?: string;
  body?: string;
  authorId?: string;
  postTime?: number;
};

export default function ArticlePage() {
  const { cid } = useParams() as { cid: string };
  const [article, setArticle] = useState<null | {
    cid: string;
    title: string;
    body: string;
    author: string;
    timestamp: number;
  }>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // trying out a direct gateway fetch to avoid initializing pinata
        const res = await fetch(`https://${GATEWAY}/ipfs/${cid}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to fetch article: ${res.status}`);

        const data = (await res.json()) as ArticleFile;

        const normalized = {
          cid,
          title: data?.title ?? "(untitled)",
          body: data?.body ?? "",
          author: data?.authorId ?? "",
          timestamp: typeof data?.postTime === "number" ? data.postTime : 0,
        };

        if (!cancelled) setArticle(normalized);
      } catch (e: any) {
        if (!cancelled) setErr(e.message || "Failed to load article");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cid]);

  const formattedAuthor = useMemo(() => {
    if (!article?.author) return "Unknown";
    return `${article.author.slice(0, 6)}…${article.author.slice(-4)}`;
  }, [article?.author]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <JellyLoader />
      </div>
    );
  }

  if (err || !article) {
    return (
      <div className="text-sm text-center text-neutral-600">
        {err ?? "Article not found."}
      </div>
    );
  }

  return (
    <article className="rounded-3xl bg-stone-50 border border-stone-200 shadow-lg shadow-stone-300 p-5">
      <div className="flex items-start justify-between mb-3">
        <Link
          href="/read"
          className="text-zinc-800 text-sm leading-none"
          aria-label="Close"
        >
          <IoMdClose/>
        </Link>
        <div className="flex-1 text-3xl text-zinc-800 font-semibold text-center mb-1">
          {article.title}
        </div>
        <div className="w-[1.5rem]"/>
      </div>
      <div className="text-center text-sm text-zinc-400">Author: {formattedAuthor}</div>
      <div className="text-center text-sm text-zinc-400 mb-3">
        {formatTimestamp(article.timestamp)}
      </div>
      <hr className="border-stone-600 mb-4" />
      <div className="text-base leading-7 text-zinc-800 whitespace-pre-wrap">
        {article.body}
      </div>
      <div className="flex justify-between pt-6">
        <button className="px-4 py-2 rounded-xl bg-zinc-800 text-stone-100 shadow-md shadow-zinc-600 hover:bg-zinc-600">
          Disagree
        </button>
        <button className="px-4 py-2 rounded-xl bg-zinc-800 text-stone-100 shadow-md shadow-zinc-600 hover:bg-zinc-600">
          Support
        </button>
      </div>
    </article>
  );
};