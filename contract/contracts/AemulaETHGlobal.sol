// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice minimal ERC20 interface for transfers
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/// @title AemulaETHGlobal
/// @notice subscriptions, article publication, and lightweight reactions with event indexing
contract AemulaETHGlobal {
    /// -------------------------------------------------------------------------------------------
    /// EVENTS
    /// -------------------------------------------------------------------------------------------
    // subscription events
    event SubscriptionStarted(address indexed user, uint256 subscriptionExpiry);
    event SubscriptionEnded(address indexed user);

    // publication events
    event ArticlePublished(address indexed author, string cid);
    event ArticleRemoved(address indexed author, string cid);

    // article interaction events
    event ArticleSupported(address indexed user, string cid);
    event ArticleDisagreed(address indexed user, string cid);

    // author payout events
    event AuthorPaid(address indexed author, uint256 amount);

    // admin events
    event AdminUpdated(address indexed admin, bool enabled);
    event CommunityTreasuryUpdated(address indexed treasury);
    event SubscriptionPriceUpdated(uint256 price);
    event SubscriptionDurationUpdated(uint256 duration);

    /// -------------------------------------------------------------------------------------------
    /// STATE
    /// -------------------------------------------------------------------------------------------
    // users => subscription expiry (unix seconds) to keep track of subscriptions
    mapping(address => uint256) public users;

    // author => list of article CIDs (chronological append) to query articles by author
    mapping(address => string[]) public authorArticles;

    // cid => author who published it (address(0) if removed/not set) to quickly prove author
    mapping(string => address) public articles;

    // admin roles
    mapping(address => bool) public admins;

    // transfers - USDC and setting the community treasury wallet (holds subscription revenue)
    IERC20 public immutable usdc;
    address public communityTreasury;

    // subscription economics that can be adjusted by admins
    uint256 public subscriptionPrice = 10 * 1e6; // 10USDC (I think)
    uint256 public subscriptionDuration = 30 days;

    /// -------------------------------------------------------------------------------------------
    /// MODIFIERS
    /// -------------------------------------------------------------------------------------------
    modifier onlyAdmin() {
        require(admins[msg.sender], "not admin");
        _;
    }

    modifier hasActiveSubscription(address user) {
        require(users[user] > block.timestamp, "subscription inactive");
        _;
    }

    /// -------------------------------------------------------------------------------------------
    /// CONSTRUCTOR
    /// -------------------------------------------------------------------------------------------
    /// @param usdcToken address of USDC token
    /// @param treasury initial community treasury address
    constructor(address usdcToken, address treasury) {
        require(usdcToken != address(0), "usdc=0");
        require(treasury != address(0), "treasury=0");
        usdc = IERC20(usdcToken);
        communityTreasury = treasury;

        admins[msg.sender] = true;
        emit AdminUpdated(msg.sender, true);
        emit CommunityTreasuryUpdated(treasury);
        emit SubscriptionPriceUpdated(subscriptionPrice);
        emit SubscriptionDurationUpdated(subscriptionDuration);
    }

    /// -------------------------------------------------------------------------------------------
    /// ADMIN FUNCTIONS
    /// -------------------------------------------------------------------------------------------
    function setAdmin(address account, bool enabled) external onlyAdmin {
        require(account != address(0), "admin=0");
        admins[account] = enabled;
        emit AdminUpdated(account, enabled);
    }

    function setCommunityTreasury(address treasury) external onlyAdmin {
        require(treasury != address(0), "treasury=0");
        communityTreasury = treasury;
        emit CommunityTreasuryUpdated(treasury);
    }

    function setSubscriptionPrice(uint256 price) external onlyAdmin {
        require(price > 0, "price=0");
        subscriptionPrice = price;
        emit SubscriptionPriceUpdated(price);
    }

    function setSubscriptionDuration(uint256 duration) external onlyAdmin {
        require(duration > 0, "duration=0");
        subscriptionDuration = duration;
        emit SubscriptionDurationUpdated(duration);
    }

    /// -------------------------------------------------------------------------------------------
    /// SUBSCRIPTION FUNCTIONS
    /// -------------------------------------------------------------------------------------------
    /// @notice Start a subscription. Requires the caller to be expired or new.
    /// Transfers `subscriptionPrice` USDC from caller to `communityTreasury`.
    /// Caller must approve this contract for `subscriptionPrice` beforehand.
    function startSubscription() external {
        require(users[msg.sender] <= block.timestamp, "already active");
        require(communityTreasury != address(0), "treasury unset");

        // pull USDC to communityTreasury wallet
        bool ok = usdc.transferFrom(msg.sender, communityTreasury, subscriptionPrice);
        require(ok, "USDC transferFrom failed");

        uint256 expiry = block.timestamp + subscriptionDuration;
        users[msg.sender] = expiry;

        emit SubscriptionStarted(msg.sender, expiry);
    }

    /// @notice End a subscription early. Marks expiry as current timestamp.
    function endSubscription() external {
        require(users[msg.sender] > block.timestamp, "not active");
        users[msg.sender] = block.timestamp;
        emit SubscriptionEnded(msg.sender);
    }

    /// @notice Check if a user has an active subscription.
    function isActive(address user) external view returns (bool) {
        return users[user] > block.timestamp;
    }

    /// -------------------------------------------------------------------------------------------
    /// ARTICLE PUBLISHING FUNCTIONS
    /// -------------------------------------------------------------------------------------------
    /// @notice Publish an article by CID. Requires active subscription.
    function publishArticle(string calldata cid) external hasActiveSubscription(msg.sender) {
        require(bytes(cid).length > 0, "cid empty");
        require(articles[cid] == address(0), "cid exists");

        // write the article to the respective mappings
        articles[cid] = msg.sender;
        authorArticles[msg.sender].push(cid);

        emit ArticlePublished(msg.sender, cid);
    }

    /// @notice Remove an article you authored. Leaves a gap in arrays to preserve chronology.
    function removeArticle(string calldata cid) external {
        require(bytes(cid).length > 0, "cid empty");
        
        // make sure the sender is the author
        address author = articles[cid];
        require(author != address(0), "cid not found");
        require(author == msg.sender, "not author");

        // remove author of article to clear ownership
        articles[cid] = address(0);

        // soft-delete in authorArticles array (preserve order for off-chain queries)
        // don't need to worry about cleaning up state for this project, but would in production
        string[] storage arr = authorArticles[msg.sender];
        for (uint256 i = 0; i < arr.length; i++) {
            if (keccak256(bytes(arr[i])) == keccak256(bytes(cid))) {
                arr[i] = ""; // mark deleted; clients should filter empty strings
                break;
            }
        }

        emit ArticleRemoved(msg.sender, cid);
    }

    /// -------------------------------------------------------------------------------------------
    /// ARTICLE INTERACTION FUNCTIONS
    /// -------------------------------------------------------------------------------------------
    /// @notice Support an article. Requires active subscription.
    function support(string calldata cid) external hasActiveSubscription(msg.sender) {
        require(articles[cid] != address(0), "cid not found");
        emit ArticleSupported(msg.sender, cid);
    }

    /// @notice Disagree with an article. Requires active subscription.
    function disagree(string calldata cid) external hasActiveSubscription(msg.sender) {
        require(articles[cid] != address(0), "cid not found");
        emit ArticleDisagreed(msg.sender, cid);
    }

    /// -------------------------------------------------------------------------------------------
    /// AUTHOR PAYOUT FUNCTIONS
    /// -------------------------------------------------------------------------------------------
    /// @notice Pay an author USDC from the community treasury (which must approve this contract).
    /// Admin-only. Does not hold funds in this contract.
    function payAuthor(address author, uint256 amount) external onlyAdmin {
        require(author != address(0), "author=0");
        require(amount > 0, "amount=0");
        require(communityTreasury != address(0), "treasury unset");

        bool ok = usdc.transferFrom(communityTreasury, author, amount);
        require(ok, "USDC transferFrom failed");

        emit AuthorPaid(author, amount);
    }
}