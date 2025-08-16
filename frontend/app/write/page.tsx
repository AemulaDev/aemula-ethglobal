"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { address, isConnected } = useAccount();

  const handlePublish = async () => {
    if (!title.trim() || !body.trim()) {
      alert("Please enter a title and body.");
      return;
    }
    if (!isConnected || !address) {
      alert("Connect a wallet to publish.");
      return;
    }

    setSubmitting(true);
    try {
      const postTime = Math.floor(Date.now() / 1000);
      const res = await fetch("/api/ipfs/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          authorId: address,
          postTime,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Upload failed");
      }

      const { cid } = await res.json();
      console.log("IPFS CID:", cid);
      setTitle(""); setBody("");
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Publish failed");
    } finally {
      setSubmitting(false);
    }
  };

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
        onClick={handlePublish}
        disabled={submitting}
      >
        {submitting ? "Publishing…" : "Publish"}
      </button>
    </div>
  );
};