// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Assessment {
    // Struct to define a transaction
    struct Transact {
        string name;       // Name of the transact
        uint256 transactionCount; // Transaction count
    }

    // Mapping to store transactions using their ID as key
    mapping(uint256 => Transact) public transactions;
    
    // Mapping to track if an address has transacted
    mapping(address => bool) public transacts;

    // Variables to track the number of transactions and total votes
    uint256 public candidatesCount;
    uint256 public totalTransaction;
    
    // Address of the contract owner (only owner can register transactions)
    address public owner;

    // Events to log the registration of transactions and votes
    event TransactionRegistered(uint256 transactionId, string candidateName);
    event Transacted(address voter, uint256 transactionId);

    // Modifier to restrict certain functions to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can register transaction.");
        _; // Placeholder for function execution
    }

    // Constructor that sets the owner and registers default transactions
    constructor() {
        owner = msg.sender; // Set the contract deployer as the owner
        registerDefaultTransaction();
    }

    // Internal function to register 3 default transactions
    function registerDefaultTransaction() internal {
        registerTransaction("Cash in");
        registerTransaction("Withdraw");
    }

    // Function to register a new candidate, only callable by the contract owner
    function registerTransaction(string memory _name) public onlyOwner {
        candidatesCount++; // Increment candidate count
        transactions[candidatesCount] = Transact(_name, 0); // Add new transact
        emit TransactionRegistered(candidatesCount, _name); // Emit event for transact registration
    }

    // Function for a user to transact
    function vote(uint256 _transactionId) public {
        // Ensure the transact ID is valid
        require(_transactionId > 0 && _transactionId <= candidatesCount, "Invalid transaction ID.");
        
        // Increment count for the chosen process
        transactions[_transactionId].transactionCount++;
        
        // Increment the total number
        totalTransaction++;
        
        // Emit event for the vote
        emit Transacted(msg.sender, _transactionId);
    }

    // Function to get the number of votes for a specific transact
    function getTransaction(uint256 _transactionId) public view returns (uint256) {
        require(_transactionId > 0 && _transactionId <= candidatesCount, "Invalid transaction ID.");
        
        // Return the how many transactions for the specified process
        return transactions[_transactionId].transactionCount;
    }

    //Gets the total number across all transactions
    function getTotalTransaction() public view returns (uint256) {
        return totalTransaction; // Return the total transactions
    }
}
