import { useState, useEffect } from "react";
import { ethers } from "ethers";
import votingSystemABI from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function TransactionSystem() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [transactContract, setTransactContract] = useState(undefined);
  const [transactions, setTransactions] = useState([]); // Store transactions
  const [totalTransaction, setTotalTransaction] = useState(undefined); //total transactions

  const contractAddress = "0x5081a39b8A5f0E35a8D959395a630b68B74Dd30f"; // Replace with your deployed contract address
  const votingABI = votingSystemABI.abi; // Import ABI of the voting contract

  // Step 1: Initialize and get the connected wallet and account
  const getWallet = async () => {
    // Check if MetaMask is installed
    if (window.ethereum) {
      console.log("MetaMask detected");
      setEthWallet(window.ethereum); // Set the ethWallet state to MetaMask provider
    } else {
      console.log("MetaMask is not installed");
      alert("Please install MetaMask to interact with this application."); // Alert if MetaMask is not installed
      return;
    }

    // If MetaMask is installed, get the accounts
    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts); // Handle the connected account
    }
  };

  // Step 2: Handle account changes
  const handleAccount = (account) => {
    if (account && account.length > 0) {
      console.log("Account connected: ", account[0]);
      setAccount(account[0]); // Set the connected account in state
    } else {
      console.log("No account found");
    }
  };

  // Step 3: Connect the account to MetaMask
  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts); // Handle the connected account
    getTransactContract(); // Once account is connected, get the contract instance
  };

  // Step 4: Get the contract instance from the Ethereum provider
  const getTransactContract = () => {
    if (!ethWallet || !account) {
      console.log("Cannot get contract: ethWallet or account is not set");
      return;
    }

    console.log("Setting up contract...");
    const provider = new ethers.providers.Web3Provider(ethWallet); // Create a Web3 provider
    const signer = provider.getSigner(); // Get the signer (user's account)

    try {
      // Initialize the contract with the ABI, address, and signer
      const contract = new ethers.Contract(contractAddress, votingABI, signer);
      console.log("Contract set:", contract);
      setTransactContract(contract); // Set the contract instance in state
    } catch (error) {
      console.error("Error setting up contract:", error);
    }
  };

  // Step 5: Fetch the list of transactions from the smart contract
  const fetchTransactions = async () => {
    if (transactContract) {
      console.log("transactContract is defined"); // Check if the contract is set
      try {
        const candidatesCount = await transactContract.candidatesCount(); // Get the number of transactions
        console.log("Transactions Count:", candidatesCount.toString()); // Log the transactions count
        let loadedTransactions = [];
        for (let i = 1; i <= candidatesCount; i++) {
          const transact = await transactContract.transactions(i); // Get each transact
          console.log("Transact:", transact); // Log each transact details
          loadedTransactions.push(transact); // Add transact to the list
        }
        setTransactions(loadedTransactions); // Set the list of transactions in state
      } catch (error) {
        console.error("Error fetching transactions:", error); // Handle any errors
      }
    } else {
      console.log("transactContract is undefined"); // If contract is not set
    }
  };

  // Step 6: Fetch the total number of votes from the smart contract
  const fetchTotalTransaction = async () => {
    if (transactContract) {
      try {
        const totalTransaction = await transactContract.getTotalTransaction(); // get total transactions
        setTotalTransaction(totalTransaction.toNumber()); // Set the total transaction in state
      } catch (error) {
        console.error("Error fetching total transactions:", error); // Handle errors
      }
    }
  };

  // Step 7: Function to cast a vote for a transact
  const voteForCandidate = async (transactionId) => {
    if (transactContract && account) {
      try {
        const tx = await transactContract.vote(transactionId); // Call vote function on the contract
        await tx.wait(); // Wait for the transaction to be mined
        fetchTransactions(); // Fetch updated list of transactions
        fetchTotalTransaction(); // Fetch updated total votes
      } catch (error) {
        console.error("Error voting:", error); // Handle errors
      }
    }
  };

  // Step 8: Render UI based on user state (whether connected to MetaMask or not)
  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask in order to use this Voting System.</p>; // Prompt user to install MetaMask if not detected
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your MetaMask wallet</button>; // If no account, show button to connect
    }

    return (
      <div>
        <h3>Choose what transactions are done:</h3>
        <div>
          {transactions.map((transact, index) => (
            <div key={index}>
              <p>
                {transact.name}: {transact.transactionCount.toString()} transactions
              </p>
              <button onClick={() => voteForCandidate(index + 1)}>
                Transactions for {transact.name}
              </button>
            </div>
          ))}
        </div>
        <p>Total Transactions: {totalTransaction}</p> {/* Display total votes */}
      </div>
    );
  };

  // Step 9: Use useEffect hooks to initialize and fetch data on mount
  useEffect(() => {
    console.log("Checking wallet...");
    getWallet(); // Initialize wallet connection when component mounts
  }, []); // Runs only once when the component is mounted

  useEffect(() => {
    if (account) {
      getTransactContract(); // Get contract once the account is available
    }
  }, [account]); // Runs when account changes

  useEffect(() => {
    if (transactContract && account) {
      fetchTransactions(); // Fetch transactions and total votes once contract and account are set
      fetchTotalTransaction();
    }
  }, [transactContract, account]); // Runs when transactContract or account changes

  return (
    <main className="container">
      <header>
        <h1>Transaction Counting System</h1>
        <p>Owner's address: {account}</p>
      </header>
      {initUser()} {/* Render the UI based on user state */}
      <style jsx>{`
        .container {
          text-align: center;
        }
        button {
          margin: 10px;
        }
      `}</style>
    </main>
  );
}
