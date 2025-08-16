import { NextResponse } from "next/server";
import { PinataSDK } from "pinata";

type ArticleFile = {
    title?: string;
    body?: string;
    authorId?: string;
    postTime?: number;
};

const pinata = new PinataSDK({
  pinataGateway: "aemula-ethglobal.mypinata.cloud",
});

export async function POST(req: Request) {
  try {
    const { cids } = await req.json();
    if (!Array.isArray(cids) || cids.length === 0) {
      return NextResponse.json({ error: "cids[] required" }, { status: 400 });
    }

    const results = await Promise.all(
      cids.map(async (cid: string) => {
        try {
          const url = await pinata.gateways.public.convert(cid);
          const res = await fetch(url, { cache: "no-store" })
          if (!res.ok) throw new Error(`Gateway fetch failed for ${cid}: ${res.status}`);
          const data = (await res.json()) as ArticleFile;
          return {
            cid,
            title: data?.title ?? "(untitled)",
            body: data?.body ?? "",
            author: data?.authorId ?? "",
            timestamp: typeof data?.postTime === "number" ? data.postTime : 0,
          };
        } catch {
          return {
            cid,
            title: "(unavailable)",
            body: "",
            author: "",
            timestamp: 0,
            _error: true,
          };
        }
      })
    );

    return NextResponse.json({ articles: results }, { status: 200 });
  } catch (err) {
    console.error("Pinata read error:", err);
    return NextResponse.json({ error: "failed to fetch articles" }, { status: 500 });
  }
};