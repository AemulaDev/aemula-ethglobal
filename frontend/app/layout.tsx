import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "./components/Navbar";
import ConnectOrSubscribeModal from "./components/ConnectOrSubscribeModal";

// diff to push deployment

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  return {
    title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
    description:
      "The decentralized platform for independent journalism",
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
        button: {
          title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
          action: {
            type: "launch_frame",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE,
            splashBackgroundColor:
              process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // gating access
  // isWalletConnected - minikit/wallet state
  // isUserRegistered - if user exists in contract user mapping
  const isWalletConnected = true; // TODO
  const isUserRegistered = true;  // TODO
  const shouldGate = !isWalletConnected || !isUserRegistered;

  return (
    <html lang="en">
      <body className="bg-stone-100 min-h-screen">
        <Providers>
          <Navbar isWalletConnected={isWalletConnected} />
          <div className="max-w-md mx-auto px-4 py-5">{children}</div>
          {/* modal to gate based on user's wallet/contract state */}
          <ConnectOrSubscribeModal
            open={shouldGate}
            isWalletConnected={isWalletConnected}
            isUserRegistered={isUserRegistered}
          />
        </Providers>
      </body>
    </html>
  );
};