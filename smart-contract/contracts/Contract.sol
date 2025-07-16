// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CarbonCertificate is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    Counters.Counter private _tokenIdCounter;
    
    // Struktur data sertifikat
    struct Certificate {
        uint256 tokenId;
        uint256 carbonAmount; // 1 token = 1 ton karbon
        string projectId;
        uint256 issueDate;
        string uniqueHash;
    }
    
    // Penyimpanan mapping
    mapping(uint256 => Certificate) private _certificates;
    mapping(string => uint256[]) private _projectTokens;
    mapping(string => uint256) private _hashToToken;
    
    // Event yang dipancarkan ketika sertifikat diterbitkan
event CertificateIssued(
    uint256 tokenId,
    address recipient,
    uint256 carbonAmount,
    string projectId,
    string uniqueHash
);
    
    constructor() ERC721("Carbon Credit Certificate", "CARBON") {}
    
    /**
     * Menerbitkan sertifikat karbon untuk suatu proyek
     * @param recipient Alamat yang akan menerima sertifikat
     * @param amount Jumlah sertifikat yang akan diterbitkan (1 sertifikat = 1 ton)
     * @param projectId ID proyek dari MongoDB
     */
    function issueCertificate(
        address recipient,
        uint256 amount,
        string memory projectId
    ) public onlyOwner returns (bool) {
        require(amount > 0, "Amount must be greater than zero");
        require(bytes(projectId).length > 0, "Project ID cannot be empty");
        
        // Membuat token sejumlah yang ditentukan
for (uint256 i = 0; i < amount; i++) {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        // Generate unique hash
        string memory uniqueHash = generateUniqueHash(tokenId, projectId, i);
        
        // Mint token
        _safeMint(recipient, tokenId);
        
        // Simpan certificate data
        Certificate memory newCertificate = Certificate({
            tokenId: tokenId,
            carbonAmount: 1,
            projectId: projectId,
            issueDate: block.timestamp,
            uniqueHash: uniqueHash
        });
        
        _certificates[tokenId] = newCertificate;
        _projectTokens[projectId].push(tokenId);
        _hashToToken[uniqueHash] = tokenId;
        
        // PENTING: Pancarkan event dengan semua parameter yang dibutuhkan
        emit CertificateIssued(
            tokenId,
            recipient,
            1, // 1 ton per sertifikat
            projectId,
            uniqueHash
        );
    }
        
        return true;
    }
    
    /**
     * Menghasilkan hash unik untuk sertifikat
     * Membuat hash yang menggabungkan beberapa elemen unik
     */
    function generateUniqueHash(
        uint256 tokenId,
        string memory projectId,
        uint256 index
    ) private view returns (string memory) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                tokenId.toString(),
                projectId,
                index.toString(),
                block.timestamp.toString(),
                block.difficulty,
                msg.sender
            )
        );
        return bytes32ToString(hash);
    }
    
    /**
     * Mengonversi bytes32 ke string hex
     */
    function bytes32ToString(bytes32 _bytes32) private pure returns (string memory) {
        bytes memory bytesArray = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            bytesArray[i*2] = _bytes2char(_bytes32[i] >> 4);
            bytesArray[i*2+1] = _bytes2char(_bytes32[i] & 0x0f);
        }
        return string(bytesArray);
    }
    
    function _bytes2char(bytes1 b) private pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
    
    /**
     * Mendapatkan detail sertifikat berdasarkan hash unik
     */
    function getCertificateByHash(string memory uniqueHash) 
        public 
        view 
        returns (Certificate memory) 
    {
        uint256 tokenId = _hashToToken[uniqueHash];
        require(tokenId > 0, "Certificate not found");
        
        return _certificates[tokenId];
    }
    
    /**
     * Memverifikasi apakah sertifikat dengan hash tertentu ada
     */
    function verifyCertificate(string memory uniqueHash) 
        public 
        view 
        returns (bool) 
    {
        return _hashToToken[uniqueHash] > 0;
    }
    
    /**
     * Mendapatkan semua sertifikat untuk proyek tertentu
     */
    function getProjectCertificates(string memory projectId) 
        public 
        view 
        returns (Certificate[] memory) 
    {
        uint256[] memory tokenIds = _projectTokens[projectId];
        Certificate[] memory certificates = new Certificate[](tokenIds.length);
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            certificates[i] = _certificates[tokenIds[i]];
        }
        
        return certificates;
    }
    
    /**
     * Mentransfer sertifikat dari satu pemilik ke pemilik lain (untuk pembelian marketplace)
     */
    function transferCertificate(uint256 tokenId, address to) public {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Not approved to transfer");
        _transfer(ownerOf(tokenId), to, tokenId);
    }
}