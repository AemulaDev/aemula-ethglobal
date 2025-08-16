"use client";

import { useState } from "react";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="space-y-3 text-zinc-800">
      <input
        className="w-full border border-stone-200 rounded-xl p-3 shadow-md shadow-stone-300"
        placeholder="Headline"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full border border-stone-200 rounded-xl p-3 min-h-[220px] shadow-md shadow-stone-300"
        placeholder="Article Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button
        className="w-full px-4 py-2 rounded-xl bg-zinc-800 text-stone-100 shadow-md shadow-zinc-400"
        onClick={() => alert("Stub: would publish to IPFS + emit event")}
      >
        Publish
      </button>
    </div>
  );
};