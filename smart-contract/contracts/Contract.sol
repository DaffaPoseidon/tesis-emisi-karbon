// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CarbonCertificate {
    // Struct to represent a carbon certificate
    struct Certificate {
        uint256 carbonAmount; // Amount of carbon in tons
        string projectId;     // Project identifier
        uint256 issueDate;    // Timestamp of issuance
        bytes32 uniqueHash;   // Unique cryptographic hash
    }

    // Mapping from tokenId to certificate data
    mapping(uint256 => Certificate) private _certificates;
    
    // Mapping from hash to tokenId
    mapping(bytes32 => uint256) private _hashToTokenId;

    // Mapping from owner to list of owned token IDs
    mapping(address => uint256[]) private _ownedTokens;

    // Mapping to check if a token exists
    mapping(uint256 => bool) private _exists;

    // Variable for tracking the token IDs
    uint256 private _tokenIds;

    // Event emitted when a certificate is issued
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 carbonAmount,
        string projectId,
        bytes32 uniqueHash
    );

    // Constructor to initialize the contract
    constructor() {}

    /**
     * @notice Generates a unique hash for a carbon certificate
     * @param recipient Address of the certificate recipient
     * @param projectId The project identifier
     * @param nonce A unique number to ensure uniqueness
     * @return A unique bytes32 hash
     */
    function generateUniqueHash(
        address recipient,
        string memory projectId,
        uint256 nonce
    ) private view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                recipient,
                projectId,
                block.timestamp,
                nonce,
                address(this)
            )
        );
    }

    /**
     * @notice Issues a carbon certificate (one per token)
     * @param recipient Address of the certificate recipient
     * @param carbonAmount The number of tons of carbon to issue
     * @param projectId The project identifier
     * @return Array of unique hashes for the tokens
     */
    function issueCertificate(
        address recipient,
        uint256 carbonAmount,
        string memory projectId
    ) external returns (bytes32[] memory) {
        require(carbonAmount > 0, "Carbon amount must be greater than zero");

        bytes32[] memory uniqueHashes = new bytes32[](carbonAmount);
        uint256[] memory newTokenIds = new uint256[](carbonAmount);

        for (uint256 i = 0; i < carbonAmount; i++) {
            _tokenIds++;
            uint256 newTokenId = _tokenIds;
            
            // Generate a cryptographic unique hash
            bytes32 uniqueHash = generateUniqueHash(recipient, projectId, newTokenId);
            
            // Ensure hash is unique by checking if it already exists
            require(_hashToTokenId[uniqueHash] == 0, "Hash collision detected");
            
            // Store the mapping from hash to tokenId
            _hashToTokenId[uniqueHash] = newTokenId;

            // Store the certificate details
            _certificates[newTokenId] = Certificate({
                carbonAmount: 1, // 1 token = 1 ton of carbon
                projectId: projectId,
                issueDate: block.timestamp,
                uniqueHash: uniqueHash
            });

            // Track the token ownership
            _ownedTokens[recipient].push(newTokenId);
            _exists[newTokenId] = true;

            newTokenIds[i] = newTokenId;
            uniqueHashes[i] = uniqueHash;

            // Emit the certificate issued event
            emit CertificateIssued(newTokenId, recipient, 1, projectId, uniqueHash);
        }

        return uniqueHashes;
    }

    /**
     * @notice Fetches the certificate data associated with a given tokenId
     * @param tokenId The ID of the token to query
     * @return The certificate data for the token
     */
    function getCertificate(uint256 tokenId) external view returns (Certificate memory) {
        require(_exists[tokenId], "Token does not exist");
        return _certificates[tokenId];
    }
    
    /**
     * @notice Fetches the certificate data associated with a unique hash
     * @param uniqueHash The unique hash of the certificate
     * @return The certificate data for the token
     */
    function getCertificateByHash(bytes32 uniqueHash) external view returns (Certificate memory) {
        uint256 tokenId = _hashToTokenId[uniqueHash];
        require(tokenId > 0, "Certificate with this hash does not exist");
        return _certificates[tokenId];
    }

    /**
     * @notice Gets the list of token IDs owned by a given address
     * @param owner The address to query
     * @return An array of token IDs owned by the address
     */
    function getOwnedTokens(address owner) external view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }
    
    /**
     * @notice Gets the unique hash for a given tokenId
     * @param tokenId The ID of the token
     * @return The unique hash of the token
     */
    function getTokenHash(uint256 tokenId) external view returns (bytes32) {
        require(_exists[tokenId], "Token does not exist");
        return _certificates[tokenId].uniqueHash;
    }
    
    /**
     * @notice Verifies if a certificate with a given hash exists
     * @param uniqueHash The hash to verify
     * @return True if the certificate exists, false otherwise
     */
    function verifyCertificate(bytes32 uniqueHash) external view returns (bool) {
        return _hashToTokenId[uniqueHash] > 0;
    }
}