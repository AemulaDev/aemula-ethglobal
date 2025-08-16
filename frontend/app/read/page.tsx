"use client";

import { useEffect, useState } from "react";
import ArticlePreview from "../components/ArticlePreview";
import { JellyLoader } from "../components/JellyLoader";

const CIDS: string[] = [
  "bafkreihfcuikj4kkecohfgoq6wc2dg5wlpddveuo4xcalgt437eeohzym4",
  "bafkreihzie2fhlzvkyoxlqaem42xjwt74lbhg3ep4wxxe5nfwfqofvajba",
  "bafkreiandtvucztnvrdqg4q4yvss45mprznbxlsx4gizzl7bfpf4zadstq",
  "bafkreichyd2op7afl7im47bko7bbp4fhf2p723xvc5unp32logid4rzdgu"
];

export default function ReadPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (CIDS.length === 0) {
          setArticles([]);
          return;
        }

        const res = await fetch("/api/ipfs/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cids: CIDS }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || "Failed to fetch articles");
        }

        const { articles } = await res.json();
        if (!cancelled) setArticles(articles || []);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Error loading articles");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <JellyLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="text-sm text-rose-500">Failed to load articles. Please try again.</div>;
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="text-sm text-rose-500">Failed to load articles. Please try again.</div>;
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((a) => (
        <ArticlePreview key={a.cid} article={a} />
      ))}
    </div>
  );
};