"use client";

import { mockArticles } from "../../lib/mockArticles";
import ArticlePreview from "../components/ArticlePreview";

export default function ReadPage() {
  return (
    <div className="space-y-4">
      {mockArticles.map((a) => (
        <ArticlePreview key={a.cid} article={a} />
      ))}
    </div>
  );
};