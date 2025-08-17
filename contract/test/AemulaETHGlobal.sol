// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../contracts/AemulaETHGlobal.sol";

/* ------------------------------------------------------------
   Minimal ERC20 mock (6 decimals) for testing transfers/allowances
-------------------------------------------------------------*/
contract MockUSDC {
    string public name;
    string public symbol;
    uint8 public immutable decimals = 6;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(string memory _name, string memory _symbol) {
        owner = msg.sender;
        name = _name;
        symbol = _symbol;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "balance");
        require(allowance[from][msg.sender] >= amount, "allowance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}

/* ------------------------------------------------------------
   Helper "Actor" contracts: simulate distinct users/admins/treasury.
   Calls are made FROM the Actor's address, so msg.sender == Actor.
-------------------------------------------------------------*/
contract Actor {
    // Generic low-level call helper to check reverts without reverting the test.
    function tryCall(address target, bytes calldata data) external returns (bool, bytes memory) {
        (bool ok, bytes memory ret) = target.call(data);
        return (ok, ret);
    }

    // Convenience wrappers for readability in tests:
    function erc20Approve(address token, address spender, uint256 amount) external returns (bool) {
        (bool ok, bytes memory ret) =
            token.call(abi.encodeWithSignature("approve(address,uint256)", spender, amount));
        require(ok, "approve failed");
        if (ret.length == 32) return abi.decode(ret, (bool));
        return true;
    }

    function start(address aemula) external {
        (bool ok, ) = aemula.call(abi.encodeWithSignature("startSubscription()"));
        require(ok, "start failed");
    }

    function end(address aemula) external {
        (bool ok, ) = aemula.call(abi.encodeWithSignature("endSubscription()"));
        require(ok, "end failed");
    }

    function publish(address aemula, string calldata cid) external {
        (bool ok, ) = aemula.call(abi.encodeWithSignature("publishArticle(string)", cid));
        require(ok, "publish failed");
    }

    function remove(address aemula, string calldata cid) external {
        (bool ok, ) = aemula.call(abi.encodeWithSignature("removeArticle(string)", cid));
        require(ok, "remove failed");
    }

    function support(address aemula, string calldata cid) external {
        (bool ok, ) = aemula.call(abi.encodeWithSignature("support(string)", cid));
        require(ok, "support failed");
    }

    function disagree(address aemula, string calldata cid) external {
        (bool ok, ) = aemula.call(abi.encodeWithSignature("disagree(string)", cid));
        require(ok, "disagree failed");
    }

    function pay(address aemula, address author, uint256 amount) external {
        (bool ok, ) = aemula.call(abi.encodeWithSignature("payAuthor(address,uint256)", author, amount));
        require(ok, "pay failed");
    }
}

/* ------------------------------------------------------------
   Minimal assertion helpers (no forge-std dependency)
-------------------------------------------------------------*/
contract Asserts {
    function _eq(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    function assertEq(uint256 a, uint256 b, string memory m) internal pure {
        require(a == b, m);
    }

    function assertEq(address a, address b, string memory m) internal pure {
        require(a == b, m);
    }

    function assertTrue(bool v, string memory m) internal pure {
        require(v, m);
    }

    function assertFalse(bool v, string memory m) internal pure {
        require(!v, m);
    }
}

/* ------------------------------------------------------------
   The Solidity unit tests
-------------------------------------------------------------*/
contract AemulaETHGlobalTest is Asserts {
    // Test actors
    Actor internal user;
    Actor internal other;
    Actor internal admin;      // secondary admin we grant
    Actor internal treasury;   // community treasury holder

    // Contracts
    MockUSDC internal usdc;
    AemulaETHGlobal internal aemula;

    // Constants
    uint256 internal constant USDC_DECIMALS = 1e6;
    uint256 internal constant STARTING_BAL = 1_000_000 * USDC_DECIMALS;

    function setUp() public {
        // Deploy mock USDC; this test contract is the owner
        usdc = new MockUSDC("USD Coin", "USDC");

        // Create actors
        user = new Actor();
        other = new Actor();
        admin = new Actor();
        treasury = new Actor();

        // Fund user & treasury with USDC
        usdc.mint(address(user), STARTING_BAL);
        usdc.mint(address(treasury), STARTING_BAL);
        usdc.mint(address(other), STARTING_BAL);

        // Deploy the Aemula contract; this test contract is the deployer/admin
        aemula = new AemulaETHGlobal(address(usdc), address(treasury));
    }

    /* ------------------- Constructor & admin ------------------- */

    function testConstructorInitialState() public {
        assertEq(address(aemula.usdc()), address(usdc), "usdc mismatch");
        assertEq(aemula.communityTreasury(), address(treasury), "treasury mismatch");
        // deployer (this test contract) is admin
        assertTrue(aemula.admins(address(this)), "deployer should be admin");
        assertEq(aemula.subscriptionPrice(), 10 * USDC_DECIMALS, "default price 10 USDC");
        assertEq(aemula.subscriptionDuration(), 30 days, "default duration 30d");
    }

    function testAdminSetAdminAndDisable() public {
        // non-admin cannot set admin
        (bool ok, ) = other.tryCall(
            address(aemula),
            abi.encodeWithSignature("setAdmin(address,bool)", address(admin), true)
        );
        assertFalse(ok, "non-admin should not set admin");

        // admin (deployer) sets a new admin
        aemula.setAdmin(address(admin), true);
        assertTrue(aemula.admins(address(admin)), "admin should be enabled");

        // zero address reverts
        (ok, ) = address(aemula).call(
            abi.encodeWithSignature("setAdmin(address,bool)", address(0), true)
        );
        assertFalse(ok, "zero admin should revert");

        // disable again
        aemula.setAdmin(address(admin), false);
        assertFalse(aemula.admins(address(admin)), "admin should be disabled");
    }

    function testAdminSetTreasuryPriceDuration() public {
        // setCommunityTreasury zero should revert
        (bool ok, ) =
            address(aemula).call(abi.encodeWithSignature("setCommunityTreasury(address)", address(0)));
        assertFalse(ok, "treasury zero should revert");

        // set to user
        aemula.setCommunityTreasury(address(user));
        assertEq(aemula.communityTreasury(), address(user), "treasury not updated");

        // price zero revert
        (ok, ) = address(aemula).call(abi.encodeWithSignature("setSubscriptionPrice(uint256)", 0));
        assertFalse(ok, "price zero should revert");

        // duration zero revert
        (ok, ) = address(aemula).call(abi.encodeWithSignature("setSubscriptionDuration(uint256)", 0));
        assertFalse(ok, "duration zero should revert");

        // update to new values
        aemula.setSubscriptionPrice(25 * USDC_DECIMALS);
        aemula.setSubscriptionDuration(14 days);

        assertEq(aemula.subscriptionPrice(), 25 * USDC_DECIMALS, "price not updated");
        assertEq(aemula.subscriptionDuration(), 14 days, "duration not updated");

        // restore treasury to real treasury actor for later tests
        aemula.setCommunityTreasury(address(treasury));
    }

    /* ------------------- Subscriptions ------------------- */

    function _approveUserForPrice() internal returns (uint256 price) {
        price = aemula.subscriptionPrice();
        // approve from user (spender is the Aemula contract)
        bool ok = user.erc20Approve(address(usdc), address(aemula), price);
        require(ok, "user approve failed");
    }

    function testStartSubscriptionTransfersUSDCAndSetsExpiry() public {
        uint256 price = _approveUserForPrice();

        uint256 beforeUser = usdc.balanceOf(address(user));
        uint256 beforeTreasury = usdc.balanceOf(address(treasury));

        user.start(address(aemula));

        uint256 afterUser = usdc.balanceOf(address(user));
        uint256 afterTreasury = usdc.balanceOf(address(treasury));
        uint256 expiry = aemula.users(address(user));

        assertEq(beforeUser - afterUser, price, "user USDC did not decrease by price");
        assertEq(afterTreasury - beforeTreasury, price, "treasury USDC did not increase by price");
        assertTrue(expiry > 0, "expiry not set");
    }

    function testStartSubscriptionWhileActiveRevertsAndEndSubscriptionWorks() public {
        _approveUserForPrice();
        user.start(address(aemula));

        // second start should fail
        (bool ok, ) =
            user.tryCall(address(aemula), abi.encodeWithSignature("startSubscription()"));
        assertFalse(ok, "should revert if already active");

        // end subscription should succeed
        user.end(address(aemula));
        // After end, isActive should be false
        bool active = aemula.isActive(address(user));
        assertFalse(active, "should not be active after end");
    }

    function testIsActiveTrueAfterStartFalseAfterEnd() public {
        _approveUserForPrice();
        user.start(address(aemula));
        assertTrue(aemula.isActive(address(user)), "should be active");

        user.end(address(aemula));
        assertFalse(aemula.isActive(address(user)), "should be inactive");
    }

    /* ------------------- Publishing & Removal ------------------- */

    function testPublishAndRemoveArticle() public {
        _approveUserForPrice();
        user.start(address(aemula));

        string memory cid = "bafy-article-1";
        user.publish(address(aemula), cid);

        // Check mappings
        address author = aemula.articles(cid);
        assertEq(author, address(user), "author not recorded");

        string memory stored0 = aemula.authorArticles(address(user), 0);
        require(_eq(stored0, cid), "authorArticles[0] not cid");

        // Duplicate publish should revert
        (bool ok, ) = user.tryCall(
            address(aemula), abi.encodeWithSignature("publishArticle(string)", cid)
        );
        assertFalse(ok, "duplicate publish should revert");

        // Non-active other cannot publish
        (ok, ) = other.tryCall(
            address(aemula), abi.encodeWithSignature("publishArticle(string)", "another")
        );
        assertFalse(ok, "non-active publish should revert");

        // Remove by author
        user.remove(address(aemula), cid);
        author = aemula.articles(cid);
        assertEq(author, address(0), "article not cleared");

        string memory afterSoftDelete = aemula.authorArticles(address(user), 0);
        require(_eq(afterSoftDelete, ""), "soft delete did not blank slot");

        // Remove not found reverts
        (ok, ) = user.tryCall(
            address(aemula), abi.encodeWithSignature("removeArticle(string)", "missing")
        );
        assertFalse(ok, "remove not found should revert");
    }

    function testRemoveArticleRequiresAuthor() public {
        _approveUserForPrice();
        user.start(address(aemula));

        string memory cid = "bafy-article-2";
        user.publish(address(aemula), cid);

        // other tries to remove
        (bool ok, ) = other.tryCall(
            address(aemula), abi.encodeWithSignature("removeArticle(string)", cid)
        );
        assertFalse(ok, "non-author remove should revert");
    }

    /* ------------------- Interactions ------------------- */

    function testSupportAndDisagree() public {
        // author publishes
        _approveUserForPrice();
        user.start(address(aemula));
        string memory cid = "bafy-article-3";
        user.publish(address(aemula), cid);

        // reader subscribes
        uint256 price = aemula.subscriptionPrice();
        bool ok = other.erc20Approve(address(usdc), address(aemula), price);
        require(ok, "other approve failed");
        other.start(address(aemula));

        // valid interactions
        other.support(address(aemula), cid);
        other.disagree(address(aemula), cid);

        // non-existent cid
        (ok, ) = other.tryCall(
            address(aemula), abi.encodeWithSignature("support(string)", "nope")
        );
        assertFalse(ok, "support non-existent should revert");
    }

    /* ------------------- Author payouts ------------------- */

    function testPayAuthorAdminOnlyNeedsAllowanceAndTransfers() public {
        // grant admin role to admin actor
        aemula.setAdmin(address(admin), true);

        uint256 amount = 123 * USDC_DECIMALS;

        // No allowance -> should revert
        (bool ok, ) = admin.tryCall(
            address(aemula),
            abi.encodeWithSignature("payAuthor(address,uint256)", address(user), amount)
        );
        assertFalse(ok, "pay without allowance should revert");

        // Approve from treasury to the Aemula contract
        ok = treasury.erc20Approve(address(usdc), address(aemula), amount);
        require(ok, "treasury approve failed");

        uint256 beforeT = usdc.balanceOf(address(treasury));
        uint256 beforeA = usdc.balanceOf(address(user));

        // Pay via admin actor
        admin.pay(address(aemula), address(user), amount);

        uint256 afterT = usdc.balanceOf(address(treasury));
        uint256 afterA = usdc.balanceOf(address(user));

        assertEq(beforeT - afterT, amount, "treasury not debited");
        assertEq(afterA - beforeA, amount, "author not credited");
    }

    function testPayAuthorValidatesInputsAndOnlyAdmin() public {
        // make sure admin actor is NOT admin yet
        assertFalse(aemula.admins(address(admin)), "admin should not be enabled");

        // non-admin call
        (bool ok, ) = admin.tryCall(
            address(aemula),
            abi.encodeWithSignature("payAuthor(address,uint256)", address(user), 1)
        );
        assertFalse(ok, "non-admin pay should revert");

        // grant admin role
        aemula.setAdmin(address(admin), true);

        // zero author
        (ok, ) = admin.tryCall(
            address(aemula),
            abi.encodeWithSignature("payAuthor(address,uint256)", address(0), 1)
        );
        assertFalse(ok, "zero author should revert");

        // zero amount
        (ok, ) = admin.tryCall(
            address(aemula),
            abi.encodeWithSignature("payAuthor(address,uint256)", address(user), 0)
        );
        assertFalse(ok, "zero amount should revert");
    }
}