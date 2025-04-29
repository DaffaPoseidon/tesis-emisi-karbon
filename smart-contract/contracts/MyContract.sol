// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CarbonCertificate {
    // Struct to represent a carbon certificate
    struct Certificate {
        uint256 carbonAmount; // Amount of carbon in tons
        string projectId;     // Project identifier
        uint256 issueDate;    // Timestamp of issuance
    }

    // Mapping from tokenId to certificate data
    mapping(uint256 => Certificate) private _certificates;

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
        string projectId
    );

    // Constructor to initialize the contract
    constructor() {}

    /**
     * @notice Issues a carbon certificate (one per token)
     * @param recipient Address of the certificate recipient
     * @param carbonAmount The number of tons of carbon to issue
     * @param projectId The project identifier
     * @return Array of new token IDs
     */
    function issueCertificate(
        address recipient,
        uint256 carbonAmount,
        string memory projectId
    ) external returns (uint256[] memory) {
        require(carbonAmount > 0, "Carbon amount must be greater than zero");

        uint256[] memory newTokenIds = new uint256[](carbonAmount);

        for (uint256 i = 0; i < carbonAmount; i++) {
            _tokenIds++;
            uint256 newTokenId = _tokenIds;

            // Store the certificate details
            _certificates[newTokenId] = Certificate({
                carbonAmount: 1, // 1 token = 1 ton of carbon
                projectId: projectId,
                issueDate: block.timestamp
            });

            // Track the token ownership
            _ownedTokens[recipient].push(newTokenId);
            _exists[newTokenId] = true;

            newTokenIds[i] = newTokenId;

            // Emit the certificate issued event
            emit CertificateIssued(newTokenId, recipient, 1, projectId);
        }

        return newTokenIds;
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
     * @notice Gets the list of token IDs owned by a given address
     * @param owner The address to query
     * @return An array of token IDs owned by the address
     */
    function getOwnedTokens(address owner) external view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }
}
