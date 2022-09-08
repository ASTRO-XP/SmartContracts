// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

interface IVelox {
    function utilBurnFor(
        uint256 amount,
        address caller,
        string memory reason
    ) external;
}

contract Velox is ERC20, AccessControlEnumerable {
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant AXP_SYS = keccak256("AXP_SYS");

    /// @notice The EIP-712 typehash for the contract's domain
    bytes32 public constant DOMAIN_TYPE_HASH =
        keccak256(
            "EIP712Domain(string name,uint256 chainId,address verifyingContract)"
        );

    /// @notice The EIP-712 typehash for the approve struct used by the contract
    bytes32 public constant CLAIM_TYPE_HASH =
        keccak256("Claim(address player,string txId,uint256 amount)");

    bytes32 public domainSeparator;

    /// @notice A record of states for signing / validating signatures
    mapping(address => bool) public signers;
    /// @notice A record of states for claimed transactions
    mapping(string => uint256) public claimTransactions;

    event BurnForReason(uint256 amount, string reason);

    event SignerAdded(address signer);

    event SignerRemoved(address signer);

    event Claimed(address player, string txId, uint256 amount);

    constructor() ERC20("Velox", "VLX") {
        _setRoleAdmin(OWNER_ROLE, OWNER_ROLE);
        _setRoleAdmin(MINTER_ROLE, OWNER_ROLE);

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(OWNER_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());

        domainSeparator = keccak256(
            abi.encode(
                DOMAIN_TYPE_HASH,
                keccak256(bytes("AstroXP|Velox")),
                getChainId(),
                address(this)
            )
        );
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function addSigner(address signer) public onlyOwner {
        require(signer != address(0), "Velox: signer is invalid");
        require(signers[signer] == false, "Velox: signer is exists");
        signers[signer] = true;

        emit SignerAdded(signer);
    }

    function removeSigner(address signer) public onlyOwner {
        require(signer != address(0), "Velox: signer is invalid");
        require(signers[signer] == true, "Velox: signer is not exists");
        signers[signer] = false;

        emit SignerRemoved(signer);
    }

    function mint(address account, uint256 amount) public onlyMinter {
        _mint(account, amount);
    }

    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }

    function burnFor(uint256 amount, string memory reason) public {
        _burn(_msgSender(), amount);
        emit BurnForReason(amount, reason);
    }

    function utilBurnFor(
        address burner,
        uint256 amount,
        string memory reason
    ) public onlyAxpSys {
        _burn(burner, amount);
        emit BurnForReason(amount, reason);
    }

    function getClaimed(string memory txId) public view returns (uint256) {
        return claimTransactions[txId];
    }

    function claim(
        address player,
        string memory txId,
        uint256 amount,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        require(player != address(0), "Velox: Invalid claimer");
        require(amount > 0, "Velox: Invalid amount");

        bytes32 structHash = keccak256(
            abi.encode(CLAIM_TYPE_HASH, player, keccak256(bytes(txId)), amount)
        );
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator, structHash)
        );
        address signatory = ecrecover(digest, v, r, s);

        require(signers[signatory], "Velox: Signer is not valid");
        require(claimTransactions[txId] == 0, "Velox: transaction is claimed");

        claimTransactions[txId] = amount;

        _mint(player, amount);

        emit Claimed(player, txId, amount);
    }

    function getChainId() internal view returns (uint256) {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        return chainId;
    }

    modifier onlyOwner() {
        require(hasRole(OWNER_ROLE, _msgSender()), "VLX: must be the owner");
        _;
    }
    modifier onlyMinter() {
        require(
            hasRole(MINTER_ROLE, _msgSender()),
            "VLX: must be a minter to mint"
        );
        _;
    }
    modifier onlyAxpSys() {
        require(hasRole(AXP_SYS, _msgSender()), "VLX: caller not an AXP_SYS");
        _;
    }
}
/// Developer: Nio Martinez
