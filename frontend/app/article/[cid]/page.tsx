import { mockArticles } from "@/lib/mockArticles";
import { formatTimestamp } from "@/lib/format";

export default function ArticlePage({ params }) {
  const article = mockArticles.find((a) => a.cid === params.cid);

  const formattedAuthor = `${article?.author.slice(0, 5)}...${article?.author.slice(-3)}`

  if (!article) {
    return <div className="text-sm text-neutral-600">Article not found.</div>;
  }

  return (
    <article className="rounded-3xl bg-stone-50 border border-stone-200 shadow-lg shadow-stone-300 p-5">
      <div className="text-3xl text-zinc-800 font-semibold text-center mb-1">{article.title}</div>
      <div className="text-center text-sm text-zinc-400">
        Author: {formattedAuthor}
      </div>
      <div className="text-center text-sm text-zinc-400 mb-3">
        {formatTimestamp(article.timestamp)}
      </div>
      <hr className="border-stone-600 mb-4" />
      <div className="text-base leading-7 text-zinc-800">
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