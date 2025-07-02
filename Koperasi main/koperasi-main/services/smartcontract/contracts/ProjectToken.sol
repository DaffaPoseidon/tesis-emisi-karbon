// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ProjectToken is ERC20 {
    using Counters for Counters.Counter;
    using Strings for uint256;

    struct TokenDetail {
        string tokenId;
        string idProjek;
        string idUser;
        int256 nilai;  // Changed to int256
    }

    struct Transaksi {
        string idUser;
        string namaUser;
        string idProjek;
        string judulProjek;
        string ownerProjek;
        int256 jumlahToken;  // Changed to int256
        int256 totalNominal;  // Changed to int256
    }

    struct ChartToken {
        string chartTokenId;
        string idUser;
        string idProjek;
        int256 nominal;  // Changed to int256
        uint256 createdAt;
    }

    struct HistoryToken {
        string historyTokenId;
        string chartTokenId;
        int256 totalNilai;  // Changed to int256
        uint256 createdAt;
    }

    struct Agreement {
        string idProjek;
        string idUser;
        string namaProyek;
        string namaPetugas;
        string alamatPetugas;
        string namaPemilikProyek;
        string nik;
        string noHp;
        string alamat;
        string signature;
        string tandaTangan;
        int256 nominalDisetujui;  // Changed to int256
        uint256 createdAt;
    }

    struct DividenProfit {
        string idProjek;
        int256 pelaksana;  // Changed to int256
        int256 pemilik;    // Changed to int256
        int256 koperasi;   // Changed to int256
        int256 pendana;    // Changed to int256
    }

    mapping(uint256 => Agreement) public agreements;
    uint256 public agreementCount;

    event AgreementCreated(
        string idProjek,
        string idUser,
        string namaProyek,
        string namaPetugas,
        string alamatPetugas,
        string namaPemilikProyek,
        string nik,
        string noHp,
        string alamat,
        string signature,
        string tandaTangan,
        int256 nominalDisetujui,
        uint256 createdAt
    );

    mapping(string => TokenDetail) public tokenDetails;
    mapping(string => ChartToken) public chartTokens;
    mapping(string => HistoryToken) public historyTokens;
    mapping(string => DividenProfit) public dividenProfit;

    Counters.Counter private tokenIdCounter;
    Counters.Counter private chartTokenIdCounter;
    Counters.Counter private historyTokenIdCounter;

    string[] public allTokenIds;

    event TokenCreated(
        string indexed tokenId,
        string idProjek,
        string idUser,
        int256 nilai 
    );
    event TokenUserUpdated(string indexed tokenId, string newIdUser);
    event ChartTokenCreated(
        string indexed chartTokenId,
        string idUser,
        string idProjek,
        int256 nominal,
        uint256 createdAt
    );
    event HistoryTokenCreated(
        string indexed historyTokenId,
        string chartTokenId,
        int256 totalNilai,
        uint256 createdAt
    );
    event TokenNominalReset(string indexed tokenId);

    event DividenProfitAdded(
        string idProjek,
        int256 pelaksana,
        int256 pemilik,
        int256 koperasi,
        int256 pendana
    );

    event DividenProfitUpdated(
        string idProjek,
        int256 pelaksana,
        int256 pemilik,
        int256 koperasi,
        int256 pendana
    );

    constructor() ERC20("ProjectToken", "PTKN") {}

    Transaksi[] public transaksiList;

    function generateUniqueId() private returns (string memory) {
        tokenIdCounter.increment();
        uint256 counter = tokenIdCounter.current();
        return
            string(
                abi.encodePacked(
                    "TKN-",
                    block.timestamp.toString(),
                    "-",
                    counter.toString()
                )
            );
    }

    function createToken(
        string memory idProjek,
        string memory idUser,
        int256 nilai
    ) public {
        string memory tokenId = generateUniqueId();

        _mint(msg.sender, uint256(nilai >= 0 ? nilai : -nilai));

        tokenDetails[tokenId] = TokenDetail(tokenId, idProjek, idUser, nilai);
        allTokenIds.push(tokenId);

        emit TokenCreated(tokenId, idProjek, idUser, nilai);
    }

    function updateTokenUser(
        string memory tokenId,
        string memory newIdUser
    ) public {
        require(
            bytes(tokenDetails[tokenId].tokenId).length > 0,
            "Project Token not found"
        );
        tokenDetails[tokenId].idUser = newIdUser;

        emit TokenUserUpdated(tokenId, newIdUser);
    }

    function getAllTokens() public view returns (TokenDetail[] memory) {
        TokenDetail[] memory tokens = new TokenDetail[](allTokenIds.length);

        for (uint256 i = 0; i < allTokenIds.length; i++) {
            tokens[i] = tokenDetails[allTokenIds[i]];
        }

        return tokens;
    }

    function getTokenById(
        string memory tokenId
    ) public view returns (TokenDetail memory) {
        require(
            bytes(tokenDetails[tokenId].tokenId).length > 0,
            "Project Token not found"
        );
        return tokenDetails[tokenId];
    }

    function getTokenByProjectId(
        string memory idProjek
    ) public view returns (TokenDetail[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            if (
                keccak256(bytes(tokenDetails[allTokenIds[i]].idProjek)) ==
                keccak256(bytes(idProjek))
            ) {
                count++;
            }
        }

        TokenDetail[] memory projekTokens = new TokenDetail[](count);

        uint256 index = 0;
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            if (
                keccak256(bytes(tokenDetails[allTokenIds[i]].idProjek)) ==
                keccak256(bytes(idProjek))
            ) {
                projekTokens[index] = tokenDetails[allTokenIds[i]];
                index++;
            }
        }

        return projekTokens;
    }

    function getTokenByUserAndProject(
        string memory idUser,
        string memory idProjek
    ) public view returns (TokenDetail[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            if (
                keccak256(bytes(tokenDetails[allTokenIds[i]].idUser)) ==
                keccak256(bytes(idUser)) &&
                keccak256(bytes(tokenDetails[allTokenIds[i]].idProjek)) ==
                keccak256(bytes(idProjek))
            ) {
                count++;
            }
        }

        TokenDetail[] memory filteredTokens = new TokenDetail[](count);

        uint256 index = 0;
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            if (
                keccak256(bytes(tokenDetails[allTokenIds[i]].idUser)) ==
                keccak256(bytes(idUser)) &&
                keccak256(bytes(tokenDetails[allTokenIds[i]].idProjek)) ==
                keccak256(bytes(idProjek))
            ) {
                filteredTokens[index] = tokenDetails[allTokenIds[i]];
                index++;
            }
        }

        return filteredTokens;
    }

    function getTotalTokens() public view returns (uint256) {
        return allTokenIds.length;
    }

    function resetTokenNominal(string memory tokenId) public {
        require(
            bytes(tokenDetails[tokenId].tokenId).length > 0,
            "Project Token not found"
        );

        int256 currentValue = tokenDetails[tokenId].nilai;
        tokenDetails[tokenId].nilai = 0;

        _burn(msg.sender, uint256(currentValue >= 0 ? currentValue : -currentValue));

        emit TokenNominalReset(tokenId);
    }

    function addTransaction(
        string memory idUser,
        string memory namaUser,
        string memory idProjek,
        string memory judulProjek,
        string memory ownerProjek,
        int256 jumlahToken,
        int256 totalNominal
    ) public {
        transaksiList.push(
            Transaksi({
                idUser: idUser,
                namaUser: namaUser,
                idProjek: idProjek,
                judulProjek: judulProjek,
                ownerProjek: ownerProjek,
                jumlahToken: jumlahToken,
                totalNominal: totalNominal
            })
        );
    }

    function getAllTransaction() public view returns (Transaksi[] memory) {
        return transaksiList;
    }

    function getTransactionByUserId(
        string memory idUser
    ) public view returns (Transaksi[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < transaksiList.length; i++) {
            if (
                keccak256(bytes(transaksiList[i].idUser)) ==
                keccak256(bytes(idUser))
            ) {
                count++;
            }
        }

        Transaksi[] memory userTransactions = new Transaksi[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < transaksiList.length; i++) {
            if (
                keccak256(bytes(transaksiList[i].idUser)) ==
                keccak256(bytes(idUser))
            ) {
                userTransactions[index] = transaksiList[i];
                index++;
            }
        }

        return userTransactions;
    }

    function getTransactionByProjectId(
        string memory idProjek
    ) public view returns (Transaksi[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < transaksiList.length; i++) {
            if (
                keccak256(bytes(transaksiList[i].idProjek)) ==
                keccak256(bytes(idProjek))
            ) {
                count++;
            }
        }

        Transaksi[] memory projectTransactions = new Transaksi[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < transaksiList.length; i++) {
            if (
                keccak256(bytes(transaksiList[i].idProjek)) ==
                keccak256(bytes(idProjek))
            ) {
                projectTransactions[index] = transaksiList[i];
                index++;
            }
        }

        return projectTransactions;
    }

    function createAgreementLetter(
        string memory _idProjek,
        string memory _idUser,
        string memory _namaProyek,
        string memory _namaPetugas,
        string memory _alamatPetugas,
        string memory _namaPemilikProyek,
        string memory _nik,
        string memory _noHp,
        string memory _alamat,
        string memory _signature,
        string memory _tandaTangan,
        int256 _nominalDisetujui
    ) public {
        agreementCount++;

        agreements[agreementCount] = Agreement({
            idProjek: _idProjek,
            idUser: _idUser,
            namaProyek: _namaProyek,
            namaPetugas: _namaPetugas,
            alamatPetugas: _alamatPetugas,
            namaPemilikProyek: _namaPemilikProyek,
            nik: _nik,
            noHp: _noHp,
            alamat: _alamat,
            signature: _signature,
            tandaTangan: _tandaTangan,
            nominalDisetujui: _nominalDisetujui,
            createdAt: block.timestamp
        });

        emit AgreementCreated(
            _idProjek,
            _idUser,
            _namaProyek,
            _namaPetugas,
            _alamatPetugas,
            _namaPemilikProyek,
            _nik,
            _noHp,
            _alamat,
            _signature,
            _tandaTangan,
            _nominalDisetujui,
            block.timestamp
        );
    }

    function getAllAgreement() public view returns (Agreement[] memory) {
        Agreement[] memory allAgreements = new Agreement[](agreementCount);
        for (uint256 i = 1; i <= agreementCount; i++) {
            allAgreements[i - 1] = agreements[i];
        }
        return allAgreements;
    }

    function getAgreementByProjectId(
        string memory idProjek
    ) public view returns (Agreement[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= agreementCount; i++) {
            if (
                keccak256(bytes(agreements[i].idProjek)) ==
                keccak256(bytes(idProjek))
            ) {
                count++;
            }
        }

        Agreement[] memory projectAgreements = new Agreement[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= agreementCount; i++) {
            if (
                keccak256(bytes(agreements[i].idProjek)) ==
                keccak256(bytes(idProjek))
            ) {
                projectAgreements[index] = agreements[i];
                index++;
            }
        }

        return projectAgreements;
    }

    string[] public allChartTokenIds;
    string[] public allHistoryTokenIds;

    function addChartToken(
        string memory idUser,
        string memory idProjek,
        int256 nominal,
        int256 totalNilai
    ) public returns (string memory chartTokenId) {
        chartTokenIdCounter.increment();
        chartTokenId = string(
            abi.encodePacked(
                "CTK-",
                block.timestamp.toString(),
                "-",
                chartTokenIdCounter.current().toString()
            )
        );

        chartTokens[chartTokenId] = ChartToken({
            chartTokenId: chartTokenId,
            idUser: idUser,
            idProjek: idProjek,
            nominal: nominal,
            createdAt: block.timestamp
        });
        allChartTokenIds.push(chartTokenId);
        emit ChartTokenCreated(chartTokenId, idUser, idProjek, nominal, block.timestamp);

        historyTokenIdCounter.increment();
        string memory historyTokenId = string(
            abi.encodePacked(
                "HTK-",
                block.timestamp.toString(),
                "-",
                historyTokenIdCounter.current().toString()
            )
        );

        historyTokens[historyTokenId] = HistoryToken({
            historyTokenId: historyTokenId,
            chartTokenId: chartTokenId,
            totalNilai: totalNilai,
            createdAt: block.timestamp
        });
        allHistoryTokenIds.push(historyTokenId);
        emit HistoryTokenCreated(historyTokenId, chartTokenId, totalNilai, block.timestamp);
        return chartTokenId;
    }

    function getChartTokensByUserIdAndProjectId(
        string memory idUser,
        string memory idProjek
    ) public view returns (ChartToken[] memory) {
        uint256 count = 0;

        for (uint256 i = 0; i < allChartTokenIds.length; i++) {
            if (
                keccak256(bytes(chartTokens[allChartTokenIds[i]].idUser)) ==
                keccak256(bytes(idUser)) &&
                keccak256(bytes(chartTokens[allChartTokenIds[i]].idProjek)) ==
                keccak256(bytes(idProjek))
            ) {
                count++;
            }
        }

        ChartToken[] memory userChartTokens = new ChartToken[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < allChartTokenIds.length; i++) {
            if (
                keccak256(bytes(chartTokens[allChartTokenIds[i]].idUser)) ==
                keccak256(bytes(idUser)) &&
                keccak256(bytes(chartTokens[allChartTokenIds[i]].idProjek)) ==
                keccak256(bytes(idProjek))
            ) {
                userChartTokens[index] = chartTokens[allChartTokenIds[i]];
                index++;
            }
        }

        return userChartTokens;
    }

    function getAllChartTokensByUserId(
        string memory idUser
    ) public view returns (ChartToken[] memory) {
        uint256 count = 0;

        for (uint256 i = 0; i < allChartTokenIds.length; i++) {
            if (
                keccak256(bytes(chartTokens[allChartTokenIds[i]].idUser)) ==
                keccak256(bytes(idUser))
            ) {
                count++;
            }
        }

        ChartToken[] memory userChartTokens = new ChartToken[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < allChartTokenIds.length; i++) {
            if (
                keccak256(bytes(chartTokens[allChartTokenIds[i]].idUser)) ==
                keccak256(bytes(idUser))
            ) {
                userChartTokens[index] = chartTokens[allChartTokenIds[i]];
                index++;
            }
        }

        return userChartTokens;
    }

    function extractTimestamp(
        string memory chartTokenId
    ) internal pure returns (uint256) {
        bytes memory idBytes = bytes(chartTokenId);
        uint256 firstDash;
        uint256 secondDash;

        for (uint256 i = 0; i < idBytes.length; i++) {
            if (idBytes[i] == "-") {
                if (firstDash == 0) {
                    firstDash = i;
                } else {
                    secondDash = i;
                    break;
                }
            }
        }

        uint256 timestamp = 0;
        for (uint256 i = firstDash + 1; i < secondDash; i++) {
            timestamp = timestamp * 10 + (uint256(uint8(idBytes[i])) - 48);
        }

        return timestamp;
    }

    function getLatestChartTokenByUserIdAndProjectId(
        string memory idUser,
        string memory idProjek
    ) public view returns (ChartToken memory) {
        ChartToken memory latestChartToken;
        uint256 latestTimestamp = 0;

        for (uint256 i = 0; i < allChartTokenIds.length; i++) {
            string memory chartTokenId = allChartTokenIds[i];
            ChartToken memory currentToken = chartTokens[chartTokenId];

            if (
                keccak256(bytes(currentToken.idUser)) ==
                keccak256(bytes(idUser)) &&
                keccak256(bytes(currentToken.idProjek)) ==
                keccak256(bytes(idProjek))
            ) {
                uint256 currentTimestamp = extractTimestamp(chartTokenId);

                if (currentTimestamp > latestTimestamp) {
                    latestTimestamp = currentTimestamp;
                    latestChartToken = currentToken;
                }
            }
        }

        return latestChartToken;
    }

    function getLatestChartTokensByProjectId(
        string memory idProjek
    ) public view returns (ChartToken[] memory) {
        ChartToken[] memory latestChartTokens = new ChartToken[](allChartTokenIds.length);
        uint256 uniqueUserCount = 0;

        for (uint256 i = 0; i < allChartTokenIds.length; i++) {
            string memory chartTokenId = allChartTokenIds[i];
            ChartToken memory currentToken = chartTokens[chartTokenId];

            if (
                keccak256(bytes(currentToken.idProjek)) ==
                keccak256(bytes(idProjek))
            ) {
                uint256 currentTimestamp = extractTimestamp(chartTokenId);

                bool isNewUser = true;
                for (uint256 j = 0; j < uniqueUserCount; j++) {
                    if (
                        keccak256(bytes(latestChartTokens[j].idUser)) ==
                        keccak256(bytes(currentToken.idUser))
                    ) {
                        isNewUser = false;
                        if (
                            currentTimestamp >
                            extractTimestamp(latestChartTokens[j].chartTokenId)
                        ) {
                            latestChartTokens[j] = currentToken;
                        }
                        break;
                    }
                }

                if (isNewUser) {
                    latestChartTokens[uniqueUserCount] = currentToken;
                    uniqueUserCount++;
                }
            }
        }

        ChartToken[] memory result = new ChartToken[](uniqueUserCount);
        for (uint256 i = 0; i < uniqueUserCount; i++) {
            result[i] = latestChartTokens[i];
        }

        return result;
    }
    
    function getHistoryTokensByUserIdAndProjectId(
        string memory idUser,
        string memory idProjek
    ) public view returns (HistoryToken[] memory) {
        HistoryToken[] memory tempTokens = new HistoryToken[](
            allChartTokenIds.length
        );
        uint256 count = 0;

        for (uint256 i = 0; i < allChartTokenIds.length; i++) {
            if (
                keccak256(bytes(chartTokens[allChartTokenIds[i]].idUser)) ==
                keccak256(bytes(idUser)) &&
                keccak256(bytes(chartTokens[allChartTokenIds[i]].idProjek)) ==
                keccak256(bytes(idProjek))
            ) {
                string memory chartTokenId = allChartTokenIds[i];
                tempTokens[count] = historyTokens[chartTokenId];
                count++;
            }
        }

        HistoryToken[] memory userHistoryTokens = new HistoryToken[](count);
        for (uint256 j = 0; j < count; j++) {
            userHistoryTokens[j] = tempTokens[j];
        }

        return userHistoryTokens;
    }

    function getHistoryTokenByChartTokenId(
        string memory chartTokenId
    ) public view returns (HistoryToken memory) {
        for (uint256 i = 0; i < allHistoryTokenIds.length; i++) {
            if (
                keccak256(
                    bytes(historyTokens[allHistoryTokenIds[i]].chartTokenId)
                ) == keccak256(bytes(chartTokenId))
            ) {
                return historyTokens[allHistoryTokenIds[i]];
            }
        }
        revert("HistoryToken not found for given ChartTokenId");
    }

    function getTotalNominalToken(
        string memory idUser,
        string memory idProjek
    ) public view returns (int256) {  // Changed to int256
        int256 totalNominal = 0;  // Changed to int256

        for (uint256 i = 0; i < allTokenIds.length; i++) {
            TokenDetail memory tokenDetail = tokenDetails[allTokenIds[i]];
            if (
                keccak256(bytes(tokenDetail.idUser)) ==
                keccak256(bytes(idUser)) &&
                keccak256(bytes(tokenDetail.idProjek)) ==
                keccak256(bytes(idProjek))
            ) {
                totalNominal += tokenDetail.nilai;
            }
        }

        return totalNominal;
    }

    function addDividenProfit(
        string memory idProjek,
        int256 pelaksana,    // Changed to int256
        int256 pemilik,      // Changed to int256
        int256 koperasi,     // Changed to int256
        int256 pendana       // Changed to int256
    ) public {
        DividenProfit memory newDividenProfit = DividenProfit({
            idProjek: idProjek,
            pelaksana: pelaksana,
            pemilik: pemilik,
            koperasi: koperasi,
            pendana: pendana
        });

        dividenProfit[idProjek] = newDividenProfit;

        emit DividenProfitAdded(
            idProjek,
            pelaksana,
            pemilik,
            koperasi,
            pendana
        );
    }

    function updateDividenProfit(
        string memory idProjek,
        int256 newPelaksana,    // Changed to int256
        int256 newPemilik,      // Changed to int256
        int256 newKoperasi,     // Changed to int256
        int256 newPendana       // Changed to int256
    ) public {
        require(
            bytes(dividenProfit[idProjek].idProjek).length > 0,
            "Dividen Profit not found"
        );

        dividenProfit[idProjek].pelaksana = newPelaksana;
        dividenProfit[idProjek].pemilik = newPemilik;
        dividenProfit[idProjek].koperasi = newKoperasi;
        dividenProfit[idProjek].pendana = newPendana;

        emit DividenProfitUpdated(
            idProjek,
            newPelaksana,
            newPemilik,
            newKoperasi,
            newPendana
        );
    }

    function getDividenProfitByProjectId(
        string memory idProjek
    ) public view returns (DividenProfit memory) {
        require(
            bytes(dividenProfit[idProjek].idProjek).length > 0,
            "Dividen Profit not found"
        );

        return dividenProfit[idProjek];
    }
}