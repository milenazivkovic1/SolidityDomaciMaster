// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
contract Auction {
   
    address payable public beneficiary; //Adresa primaoca
    uint public auctionEndTime; //Vreme trajanja u sekundama
    string private secretMessage; 

    // Trenuno stanje aukcije.
    address public highestBidder; 
    uint public highestBid;

    mapping(address => uint) pendingReturns;
    mapping(address => uint[]) public userAuctionHistory;

    bool ended; 
    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    error AuctionAlreadyEnded();
    error BidNotHighEnough(uint highestBid);
    error AuctionNotYetEnded();
    error AuctionEndAlreadyCalled();
   constructor(
        uint biddingTime,
        address payable beneficiaryAddress,
        string memory secret // Parametar za podatke tajne poruke
    ) {
        beneficiary = beneficiaryAddress;
        auctionEndTime = block.timestamp + biddingTime;
        secretMessage = secret; // Postavljanje tajne poruke
    }
    function bid() external payable {
        if (ended)
            revert AuctionAlreadyEnded();

        if (msg.value <= highestBid)
            revert BidNotHighEnough(highestBid);

        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid;//*Objašnenje
        }
        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);

        // Dodavanje licitacije u istoriju korisnika
        userAuctionHistory[msg.sender].push(highestBid);
    }

    function withdraw() external returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;

            if (!payable(msg.sender).send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }
    function auctionEnd() external {

        // 1. Uslovi
        if (block.timestamp < auctionEndTime)
            revert AuctionNotYetEnded();
        if (ended)
            revert AuctionEndAlreadyCalled();

        // 2. Efekti
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        // 3. Interakcija
        beneficiary.transfer(highestBid);
    }

    function getSecretMessage() external view returns (string memory) {
        // Proveravamo da li je pozivatelj dobitnik aukcije
        require(ended, "The auction has not ended yet.");
        require(msg.sender == highestBidder, "Only the auction winner can access the secret code.");
        return secretMessage;
    }
}