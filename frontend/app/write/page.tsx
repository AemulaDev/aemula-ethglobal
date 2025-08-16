"use client";

import { useState } from "react";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="space-y-3">
      <input
        className="w-full border border-neutral-300 rounded-xl p-3"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full border border-neutral-300 rounded-xl p-3 min-h-[220px]"
        placeholder="Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button
        className="w-full px-4 py-2 rounded-xl bg-black text-white"
        onClick={() => alert("Stub: would publish to IPFS + emit event")}
      >
        Publish
      </button>
    </div>
  );
};