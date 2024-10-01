import algosdk from 'algosdk';
import { NetworkId, WalletId, WalletManager, } from '@txnlab/use-wallet'
import { WalletProvider, } from '@txnlab/use-wallet-react'

export const NODE_URL = 'https://mainnet-api.algonode.cloud';
export const NODE_TOKEN = '';
export const NODE_PORT = 443;

const walletManager = new WalletManager({
  wallets: [
    WalletId.DEFLY,
    WalletId.PERA,
    // WalletId.EXODUS,
    // WalletId.KIBISIS,
    // {
    //   id: WalletId.WALLETCONNECT,
    //   options: { projectId: '<YOUR_PROJECT_ID>' }
    // },
    // {
    //   id: WalletId.MAGIC,
    //   options: { apiKey: '<YOUR_API_KEY>' }
    // },
    // {
    //   id: WalletId.LUTE,
    //   options: { siteName: '<YOUR_SITE_NAME>' }
    // }
  ],
  network: NetworkId.MAINNET,
  algod: {
    token: NODE_TOKEN,
    baseServer: NODE_URL,
    port: NODE_PORT,
  }
});

function W({ children }) {
  return <WalletProvider manager={walletManager}>
    {children}
  </WalletProvider>;
}

export default W;
