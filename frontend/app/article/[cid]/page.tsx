import { mockArticles } from "@/lib/mockArticles";
import { formatTimestamp } from "@/lib/format";

export default function ArticlePage({ params }) {
  const article = mockArticles.find((a) => a.cid === params.cid);

  if (!article) {
    return <div className="text-sm text-neutral-600">Article not found.</div>;
  }

  return (
    <article className="rounded-3xl border border-neutral-300 p-5">
      <h1 className="text-3xl font-semibold text-center mb-1">{article.title}</h1>
      <div className="text-center text-sm text-neutral-600">
        Author: {article.author}
      </div>
      <div className="text-center text-sm text-neutral-600 mb-3">
        {formatTimestamp(article.timestamp)}
      </div>
      <hr className="border-neutral-200 mb-4" />
      <div className="text-base leading-7">
        {article.body}
      </div>

      <div className="flex justify-between pt-6">
        <button className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50">
          Disagree
        </button>
        <button className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50">
          Support
        </button>
      </div>
    </article>
  );
};