import { NextResponse } from "next/server";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: "aemula-ethglobal.mypinata.cloud",
});

export async function POST(req: Request) {
  try {
    const { title, body, authorId, postTime } = await req.json();

    // just make sure we have everything
    if (!title || !body || !authorId || !postTime) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // construct a json object
    const payload = { title, body, authorId, postTime };

    // make a json file
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const timeSuffix = String(postTime).slice(-5);
    const filenameSafeTitle = title.trim().slice(0, 64).replace(/[^\w\-]+/g, "_");
    const filename = `${filenameSafeTitle || "article"}_${timeSuffix}.json`;
    const file = new File([blob], `${filename || "article"}.json`, {
      type: "application/json",
    });

    // upload
    const upload = await pinata.upload.public.file(file);

    // return CID on success to write ownership to chain
    return NextResponse.json({ cid: upload.cid }, { status: 200 });
  } catch (err: any) {
    console.error("Pinata upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
};