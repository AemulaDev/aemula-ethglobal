"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Address } from "@coinbase/onchainkit/identity";
import SegmentedTabs from "../components/SegmentedTabs";

export default function Navbar({ isWalletConnected }) {
  const pathname = usePathname();
  const tab = pathname.startsWith("/write") ? "write" : "read";

  isWalletConnected = false;

  return (
    <nav className="border-b border-neutral-200x">
      <div className="max-w-md mx-auto h-14 flex items-center justify-between px-4">
        <Link href="/read" className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-black" />
          <span className="font-semibold">aemula</span>
        </Link>

        <div className="text-sm text-neutral-700 flex items-center gap-2">
          {isWalletConnected ? (
            <Address className="text-sm" />
          ) : (
            <span className="text-neutral-500">No Wallet Connected</span>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pb-3">
        <SegmentedTabs active={tab} />
      </div>
    </nav>
  );
};