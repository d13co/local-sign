import { useState, useEffect, } from 'react'
import algosdk from 'algosdk';
import { decode } from 'algo-msgpack-with-bigint';
import { useWallet } from '@txnlab/use-wallet-react';
import WalletProvider from './WalletProvider.jsx';
import { abbrev } from './util.js';
import './App.css';

function WalletMenu() {
  const { wallets, activeWallet, activeAccount } = useWallet()

  return (
    <div style={{display: 'flex', alignSelf: 'center', padding: '1rem', width: "50vw", justifyContent: "space-around",}}>
      { activeWallet ? (
        <div>
          <p>{abbrev(activeAccount?.address)} ({activeWallet.metadata.name})</p>
          <button onClick={() => activeWallet.disconnect()}>Disconnect</button>
        </div>
      ) : wallets.map((wallet) => (
          <div key={wallet.id}>
            <button onClick={() => wallet.connect()}>{wallet.metadata.name}</button>
          </div>
        )) }
    </div>
  )
}

export function Account() {
  const { activeAccount, activeWallet, wallets } = useWallet();
  return activeAccount ? <div>Connected: {abbrev(activeAcount.address)} ({activeWallet.metadata.name}) <button onClick={activeWallet?.disconnect}>Disconnect</button></div> :
            <>{wallets?.map((wallet) => (
        <div key={wallet.metadata.id}>
          <h4>
            <img
              width={30}
              height={30}
              alt={`${wallet.metadata.name} icon`}
              src={wallet.metadata.icon}
            />
            {wallet.metadata.name} {wallet.isActive && '[active]'}
          </h4>
          <div>
            <button type="button" onClick={wallet.connect} disabled={wallet.isConnected}>
              Connect
            </button>
            <button type="button" onClick={wallet.disconnect} disabled={!wallet.isConnected}>
              Disconnect
            </button>
            <button
              type="button"
              onClick={wallet.setActivewallet}
              disabled={!wallet.isConnected || wallet.isActive}
            >
              Set Active
            </button>

            <div>
              {wallet.isActive && wallet.accounts.length && (
                <select
                  value={activeAccount?.address}
                  onChange={(e) => wallet.setActiveAccount(e.target.value)}
                >
                  {wallet.accounts.map((account) => (
                    <option key={account.address} value={account.address}>
                      {account.address}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      ))}
    </>;
}

function App() {
  const [count, setCount] = useState(0)
  const { activeAccount, signTransactions, } = useWallet();
  const [raw, setRaw] = useState("");
  const [status, setStatus] = useState("");
  const [txn, setTxn] = useState();
  const [signed, setSigned] = useState();

  const onChangeRaw = ({ target: { value }}) => {
    setRaw(value)
  }

  const sign = () => {
    (async() => {
      if (!txn.genesisID)
        txn.genesisID  = "mainnet-v1.0"
      const signed = await signTransactions([
        algosdk.encodeUnsignedTransaction(txn)
      ]);
      const s = Buffer.from(signed[0]).toString('base64');
      setSigned(s);
    })()
  }

  useEffect(() => {
    let parsed;
    if (!raw) {
      setStatus("");
      setTxn();
      setSigned();
      return;
    }
    try {
      parsed = Buffer.from(raw, 'base64');
      console.log("parsed", parsed.length);
    } catch(e) {
      console.error(e);
      setStatus("Failed to parse base64: "+e.message);
      setTxn();
      return;
    }
    let txn;
    console.log("Eff");
    try {
      txn = algosdk.Transaction.from_obj_for_encoding(decode(parsed).txn);
      setTxn(txn);
      setSigned('');
    } catch(e) {
      console.error(e);
      setStatus("Failed to parse txn: "+e.message);
      setTxn();
      return;
    }
    setStatus("ID: " + txn.txID());
  }, [raw]);

  const copySigned = () => {
    navigator.clipboard.writeText(signed);
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', width: '100vw', height: '100svh', alignItems: 'center', justifyContent: 'space-between',}}>
      <WalletMenu />
      { activeAccount ? <>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',}}>
          <p>Base 64 encoded txn</p>
          <textarea onChange={onChangeRaw} value={raw} style={{width: '50vw'}} rows="6">
          </textarea>
          <div style={{margin: '1rem'}}>{status}</div>
          { txn ? <div style={{maxWidth: '95vw', marginBottom: '1rem',}}><code style={{wordBreak: 'break-all'}}>{presentTxn(txn)}</code></div> : null }
          { txn ? <button onClick={sign}>SIGN</button> : null }
          { signed ? <div className="vflex"><hr width="50%" />Signed
            <textarea value={signed} style={{width: '50vw', marginTop: '0.5rem'}} rows="6" disabled></textarea>
            <button onClick={copySigned}>COPY</button>
          </div> : null }
        </div>
        <div></div>
      </> : null
      }
    </div>
  )
}

export function Wrapper() {
  return <WalletProvider>
    <App/>
  </WalletProvider>
}

function presentTxn(txn) {
  const out = txn.get_obj_for_encoding();
  for(const field of ['rcv', 'snd', 'arcv']) {
    if (out[field]) {
      out[field] = bufferToAddr(out[field])
    }
  }
  out.gh = out.gh?.toString("base64");
  out.note = out.note?.toString();
  return JSON.stringify(out);
}

function bufferToAddr(b) {
  return algosdk.encodeAddress(b);
}

export default Wrapper
