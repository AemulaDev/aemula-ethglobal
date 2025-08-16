"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Address } from "@coinbase/onchainkit/identity";
import SegmentedTabs from "../components/SegmentedTabs";
import { BsVectorPen } from "react-icons/bs";

export default function Navbar({ isWalletConnected }) {
  const pathname = usePathname();
  const tab = pathname.startsWith("/write") ? "write" : "read";

  isWalletConnected = false;

  return (
    <nav className="">
      <div className="max-w-md mx-auto h-14 flex items-center justify-between px-4 text-lg">
        <Link href="/read" className="flex items-center gap-1 text-zinc-800">
          <BsVectorPen />
          <span className="">Aemula</span>
        </Link>

        <div className="text-sm text-zinc-400 flex items-center gap-2">
          {isWalletConnected ? (
            <Address className="" />
          ) : (
            <span className="">No Wallet Connected</span>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        <SegmentedTabs active={tab} />
      </div>
    </nav>
  );
};