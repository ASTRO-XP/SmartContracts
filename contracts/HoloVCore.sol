// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract HoloVCore is
    Context,
    AccessControlEnumerable,
    ERC721Enumerable,
    ERC721Burnable,
    ERC721Pausable
{
    using Strings for uint256;
    using Counters for Counters.Counter;

    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    bytes32 public constant ASTRO_MECHANIC_ROLE =
        keccak256("ASTRO_MECHANIC_ROLE");
    bytes32 public constant ASTRO_BLACKSMITH_ROLE =
        keccak256("ASTRO_BLACKSMITH_ROLE");

    mapping(uint256 => string) private _tokenURIs;

    Counters.Counter private _tokenIdTracker;

    /**
     * @dev Sets base uri of chosen ipfs gateway
     *
     * "Lazuliths" are subpath uri of the token on the ipfs gateway
     */
    string private astroGateway;

    event HoloProject(
        address indexed _owner,
        string _enhancedLazulith,
        uint256 indexed _id
    );
    event Enhanced(
        address indexed _owner,
        string _enhancedLazulith,
        uint256 _id
    );
    event Forged(address indexed _owner, bytes32 indexed _id, uint256 _value);

    constructor(
        string memory _tokenName,
        string memory _symbol,
        string memory _astroGateway
    ) ERC721(_tokenName, _symbol) {
        _setRoleAdmin(OWNER_ROLE, OWNER_ROLE);
        _setRoleAdmin(MINTER_ROLE, OWNER_ROLE);
        _setRoleAdmin(PAUSER_ROLE, OWNER_ROLE);
        _setRoleAdmin(ASTRO_BLACKSMITH_ROLE, OWNER_ROLE);
        _setRoleAdmin(ASTRO_MECHANIC_ROLE, OWNER_ROLE);

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(OWNER_ROLE, _msgSender());
        astroGateway = _astroGateway;
        _tokenIdTracker.increment(); //no token ID zero
    }

    function holoProject(address _to, string memory _lazulith)
        public
        virtual
        onlyMinter
        returns (uint256)
    {
        return _holoProject(_to, _lazulith);
    }

    function upgradeHolov(
        address _hvOwner,
        uint256 _id,
        string memory _lazulith
    ) public virtual onlyAstroMechanic {
        _setTokenURI(_id, _lazulith);
        emit Enhanced(_hvOwner, _lazulith, _id);
    }

    function vForge(
        uint256 _fuser1ID,
        uint256 _fuser2ID,
        address _fuser,
        string memory _neoHoloVLazulith
    ) public virtual onlyAstroBlacksmith returns (uint256) {
        uint256 id = 0;
        if (bytes(_neoHoloVLazulith).length != 0) {
            id = _holoProject(_fuser, _neoHoloVLazulith);
        }
        burn(_fuser1ID);
        burn(_fuser2ID);
        return id;
    }

    function _holoProject(address _to, string memory _lazulith)
        internal
        returns (uint256)
    {
        uint256 id = _tokenIdTracker.current();
        _tokenIdTracker.increment();
        _mint(_to, id);
        _setTokenURI(id, _lazulith);
        emit HoloProject(_to, _lazulith, id);
        return id;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, _tokenURIs[tokenId]))
                : "";
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI)
        internal
        virtual
    {
        require(
            _exists(tokenId),
            "ERC721URIStorage: URI set of nonexistent holov"
        );
        _tokenURIs[tokenId] = _tokenURI;
    }

    function pause() public virtual onlyPauser {
        _pause();
    }

    function unpause() public virtual onlyPauser {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerable, ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function getAstroGateway() public view virtual returns (string memory) {
        return astroGateway;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return getAstroGateway();
    }

    /**
     * @dev Sets base uri of chosen ipfs gateway
     *
     * Updatable base ipfs gateway: to be able to change gateway providers
     * and migrate for a faster gateway in in the future or if any problem
     * arises in the current ipfs gateway
     */
    function setAstroGateway(string memory _astroGateway)
        external
        virtual
        onlyOwner
    {
        astroGateway = _astroGateway;
    }

    modifier onlyOwner() {
        require(hasRole(OWNER_ROLE, _msgSender()), "HOLOV: must be the owner");
        _;
    }
    modifier onlyMinter() {
        require(
            hasRole(MINTER_ROLE, _msgSender()),
            "HOLOV: must be a minter to mint"
        );
        _;
    }
    modifier onlyPauser() {
        require(
            hasRole(PAUSER_ROLE, _msgSender()),
            "HOLOV: must be a pauser to pause"
        );
        _;
    }
    modifier onlyAstroMechanic() {
        require(
            hasRole(ASTRO_MECHANIC_ROLE, _msgSender()),
            "HOLOV: must be an Astro Mechanic to Enhance"
        );
        _;
    }
    modifier onlyAstroBlacksmith() {
        require(
            hasRole(ASTRO_BLACKSMITH_ROLE, _msgSender()),
            "HOLOV: must be an Astro Blacksmith to vForge"
        );
        _;
    }
}
/// Developer: Nio Martinez
