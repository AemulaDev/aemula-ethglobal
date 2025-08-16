"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";

export default function ConnectOrSubscribeModal({
  open,
  isWalletConnected,
  isUserRegistered,
}) {
  // locking the page if the modal is open
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow || "";
    };
  }, [open]);

  if (!open) return null;

  const needsWallet = !isWalletConnected;
  const needsSubscription = isWalletConnected && !isUserRegistered;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-modal-title"
    >
      <div className="absolute inset-0 bg-zinc-800/40" />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-stone-100 p-6 shadow-xl text-center">
          <div className="text-lg font-semibold mb-2 text-zinc-800">
            Login
          </div>
          <div className="text-sm text-zinc-800 mb-4">
            {needsWallet
              ? "Connect your wallet"
              : "Subscribe to continue"}
          </div>

          <div className="flex justify-center">
            {needsWallet && (
              <ConnectWallet
                className="w-full max-w-[7rem] px-4 py-2 rounded-lg shadow-md shadow-zinc-400 bg-zinc-800 text-stone-100 hover:bg-zinc-600"
              />
            )}

            {needsSubscription && (
              <button className="w-full max-w-[7rem] px-4 py-2 rounded-lg shadow-md shadow-zinc-400 bg-zinc-800 text-stone-100 hover:bg-zinc-600">
                Subscribe!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};