"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { Identity, Avatar, Name } from "@coinbase/onchainkit/identity";
import SegmentedTabs from "../components/SegmentedTabs";
import { BsVectorPen } from "react-icons/bs";

export default function Navbar() {
  const pathname = usePathname();
  const tab = pathname.startsWith("/write") ? "write" : "read";
  const { isConnected, address } = useAccount();

  return (
    <nav>
      <div className="max-w-md mx-auto h-14 flex items-center justify-between px-4 text-lg">
        <Link href="/read" className="flex items-center gap-1 text-zinc-800">
          <BsVectorPen />
          <span>Aemula</span>
        </Link>

        <div className="flex items-center gap-2">
          {isConnected && address ? (
            <Identity address={address} className="text-zinc-800 bg-stone-100">
              <Avatar className="h-5 w-5" />
              <Name className="text-sm font-normal" />
            </Identity>
          ) : (
            <ConnectWallet className="p-1 rounded-lg text-sm bg-zinc-800 text-stone-100 hover:bg-zinc-600" />
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        <SegmentedTabs active={tab} />
      </div>
    </nav>
  );
};