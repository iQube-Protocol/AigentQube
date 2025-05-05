import { createThirdwebClient } from "thirdweb";
import {
  inAppWallet,
  createWallet,
  walletConnect,
  getAllWalletsList
} from "thirdweb/wallets"; 
import { polygon } from "thirdweb/chains";

import { coinbaseWallet, embeddedWallet, metamaskWallet, phantomWallet, rainbowWallet, ThirdwebProvider, trustWallet, zerionWallet } from '@thirdweb-dev/react';

export const thirdWebClient = createThirdwebClient({
 clientId: "8dc8e3e2452cdf667e0452a5be2906e7",
 chain: polygon,
 wallets: [
   // ─────────────────────────────────────────────────────
   // 1) In-App Wallet (web2 + passkey + guest + external)
   //    email, phone, passkey, Google, Apple, Facebook, etc.
   inAppWallet({
     auth: {
       mode: "popup",
       options: [
         "email",
         "phone",
         "passkey",
         "google",
         "apple",
         "facebook",
       ],
       passkeyDomain: window.location.origin,
     },
   }),
   embeddedWallet(),
           metamaskWallet(),
           coinbaseWallet(),
           walletConnect(),
           trustWallet(),
           rainbowWallet(),
           zerionWallet(),
           phantomWallet(),
   getAllWalletsList(),

   // ─────────────────────────────────────────────────────
   // 2) WalletConnect (QR-modal for 500+ wallets)
   walletConnect(),

   // ─────────────────────────────────────────────────────
   // 3) Individual on-chain wallets by ID
   createWallet("io.metamask"),         // MetaMask :contentReference[oaicite:1]{index=1}
   createWallet("app.phantom"),         // Phantom :contentReference[oaicite:2]{index=2}
   createWallet("me.rainbow"),          // Rainbow :contentReference[oaicite:3]{index=3}
   createWallet("com.trustwallet.app"), // Trust Wallet :contentReference[oaicite:4]{index=4}
   createWallet("io.zerion.wallet"),    // Zerion :contentReference[oaicite:5]{index=5}
   // …add any others you like with their ID strings…
 ],
});

