# Aemula ETHGlobal Hackathon Project

## Description
A decentralized protocol for independent journalism to reverse the trend of polarization in media.

### Core Scope
- Base MiniApp
    - Login w/ Base wallet
    - Contract interactions
        - Subscribe to contract access
        - Publish articles
            - IPFS for now
            - Attempt to build out Walrus data store?
        - Read articles
        - Interact w/ articles
    - Share articles
        - Mint content coin on article publication
            - Ticker is just CID of article
        - On user share
            - Prompt if they wish to purchase content coin
- CDP
    - CDP Data API
        - Subscription confirmations
        - User state
    - Onramp to load USDC
    - Server wallets?
        - Subscription admin?
        - Writer payout admin?
- Base Sepolia Contract
    - Test & deploy using Hardhat
    - User mapping
        - address -> subscription expiration timestamp
    - Author mapping
        - address -> IPFS CID of article
    - Article mapping
        - IPFS CID -> address
    - Admin role?
    - publishArticle
    - startSubscription
    - removeUser
    - supportArticle
    - disagreeArticle
- Graph Protocol Subgraph
    - Index article interaction events
    - GraphQL query to build graph visualization of readers & articles?

## Project Structure
- /backend
    - express.js backend for any server wallets/admin roles
- /contract
    - using Hardhat to test & deploy a Base Sepolia smart contract
- /frontend
    - Base MiniKit template
    - Next.js
    - Tailwindcss
- /subgraph
    - Graph Protocol subgraph for indexing article interactions