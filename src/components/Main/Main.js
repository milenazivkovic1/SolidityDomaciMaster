import React, { useState, useEffect } from 'react';
import AuctionList from '../AuctionList/AuctionList.js';
import CreateAuctionModal from '../CreateAuctionModal/CreateAuctionModal.js';
import Web3 from 'web3';
import AuctionFactoryABI from '../../contracts/AuctionFactory.json';
import { Contract } from 'web3-eth-contract';
import './Main.css';
const auctionFactoryAddress = "0xA8f280e69139B513C5f13415137f1378d2a8c4Aa";
const sepoliaRPCUrl = "https://sepolia.infura.io/v3/cd3d74c20a2044d497f39f28d0a0b5a2";

const Main = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [userAuctionHistory, setUserAuctionHistory] = useState([]);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        console.log("Connected to Ethereum account: ", accounts[0]);
        window.ethereum.on('accountsChanged', (newAccounts) => {
          setAccount(newAccounts[0]);
          console.log("Switched to account: ", newAccounts[0]);
        });
      } else {
        console.log("MetaMask is not installed.");
      }
    } catch (error) {
      console.error("Error connecting to MetaMask: ", error);
    }
  };


  useEffect(() => {
    const web3Instance = new Web3(sepoliaRPCUrl);
    console.log(web3Instance);
    setWeb3(web3Instance);
    connectWallet();
    console.log("Web3 instance set up: ", web3);
  }, []);

  
  const loadUserAuctionHistory = async () => {
    try {
      const contract = new Contract(AuctionFactoryABI.abi, auctionFactoryAddress);
      const userHistory = await contract.methods.userAuctionHistory(account).call();
      setUserAuctionHistory(userHistory);
      console.log("User Auction History:", userHistory);
    } catch (error) {
      console.error("Error loading user auction history:", error);
    }
  };

  useEffect(() => {
    loadUserAuctionHistory();
    console.log("useEffect called");
  }, [web3, loadUserAuctionHistory]);




  return (
    <div className="main-container">
      {!account && (
        <button className="connect-wallet-button" onClick={connectWallet}>
          Poveži se sa MetaMaskom
        </button>
      )}

      <AuctionList className="auction-list" web3={web3} account={account} auctionFactoryAddress={auctionFactoryAddress} />
      <button className="create-auction-button" onClick={() => setShowCreateModal(true)}>
        Napravi Aukciju
      </button>
      {showCreateModal && (
        <CreateAuctionModal className="create-auction-modal" web3={web3} account={account} onClose={() => setShowCreateModal(false)} auctionFactoryAddress={auctionFactoryAddress} />
      )}
      
      <div>
      <h2>User Auction History</h2>
      <ul>
        {userAuctionHistory.map((auction, index) => (
          <li key={index}>Auction {index + 1}: {auction}</li>
        ))}
      </ul>
    </div>

    </div>
  );
}

export default Main;