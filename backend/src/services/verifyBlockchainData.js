const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function verifyBlockchainData(transactionHash) {
  try {
    console.log("=== VERIFIKASI DATA BLOCKCHAIN ===");
    
    // Coba load .env dari lokasi yang benar
    const envPath = path.resolve(__dirname, "../.env");
    console.log("Loading .env from:", envPath);
    
    if (!fs.existsSync(envPath)) {
      throw new Error(`File .env tidak ditemukan di: ${envPath}`);
    }
    
    // Load .env secara manual
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    // Parse manual dan set ke process.env
    envLines.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
          console.log(`Set ${key.trim()} = ${value.trim()}`);
        }
      }
    });
    
    // Verifikasi variabel penting
    console.log("\nVerifikasi variabel environment:");
    console.log("- BESU_RPC_URL:", process.env.BESU_RPC_URL);
    console.log("- CONTRACT_ADDRESS:", process.env.CONTRACT_ADDRESS_SMARTCONTRACT);
    
    if (!process.env.BESU_RPC_URL) {
      throw new Error("BESU_RPC_URL tidak ditemukan di .env");
    }
    
    if (!process.env.CONTRACT_ADDRESS_SMARTCONTRACT) {
      throw new Error("CONTRACT_ADDRESS_SMARTCONTRACT tidak ditemukan di .env");
    }
    
    // Setup connection
    const provider = new ethers.JsonRpcProvider(process.env.BESU_RPC_URL);
    console.log("Berhasil terhubung ke provider:", process.env.BESU_RPC_URL);
    
    // Load contract ABI
    const contractABIPath = path.join(
      __dirname,
      "../../../smart-contract/artifacts/contracts/Contract.sol/CarbonCertificate.json"
    );
    
    if (!fs.existsSync(contractABIPath)) {
      throw new Error(`File ABI tidak ditemukan di: ${contractABIPath}`);
    }
    
    const contractData = JSON.parse(fs.readFileSync(contractABIPath, "utf8"));
    const contractABI = contractData.abi;
    const contractAddress = process.env.CONTRACT_ADDRESS_SMARTCONTRACT;
    
    // Create contract instance (read-only)
    const carbonContract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );
    
    // 1. Get transaction data
    console.log(`\nMendapatkan data transaksi ${transactionHash}...`);
    const tx = await provider.getTransaction(transactionHash);
    if (!tx) {
      throw new Error("Transaksi tidak ditemukan");
    }
    
    console.log("Data transaksi ditemukan!");
    console.log("- Dari:", tx.from);
    console.log("- Ke (contract):", tx.to);
    console.log("- Block:", tx.blockNumber);
    
    // 2. Get receipt
    console.log("\nMendapatkan receipt transaksi...");
    const receipt = await provider.getTransactionReceipt(transactionHash);
    console.log("- Status:", receipt.status === 1 ? "SUKSES" : "GAGAL");
    console.log("- Gas Used:", receipt.gasUsed.toString());
    
    // 3. Decode input data
    console.log("\nDecoding input data...");
    try {
      const iface = new ethers.Interface(contractABI);
      const decodedData = iface.parseTransaction({ data: tx.data });
      
      console.log("Fungsi yang dipanggil:", decodedData.name);
      console.log("Parameter:");
      
      // Parse JSON data jika ada parameter projectData (umumnya parameter ke-4)
      if (decodedData.args.length >= 4) {
        try {
          // Parameter ke-4 biasanya projectData dalam JSON format
          const projectData = JSON.parse(decodedData.args[3]);
          console.log("\n== DATA JSON LENGKAP DALAM BLOCKCHAIN ==");
          console.log(JSON.stringify(projectData, null, 2));
          
          // Bukti data lengkap tersimpan di blockchain
          console.log("\n== BUKTI DATA TERSIMPAN DI BLOCKCHAIN ==");
          console.log("- Nama Proyek:", projectData.namaProyek);
          console.log("- Luas Tanah:", projectData.luasTanah);
          console.log("- Sarana Penyerap Emisi:", projectData.saranaPenyerapEmisi);
          console.log("- Lembaga Sertifikasi:", projectData.lembagaSertifikasi);
          console.log("- Kepemilikan Lahan:", projectData.kepemilikanLahan);
          console.log("- Tanggal Mulai:", projectData.tanggalMulai);
          console.log("- Tanggal Selesai:", projectData.tanggalSelesai);
          console.log("- Jumlah Karbon:", projectData.jumlahKarbon);
          console.log("- pengunggah:", projectData.pengunggah);
          console.log("- Status Pengajuan:", projectData.statusPengajuan);
          console.log("- Created At:", projectData.createdAt);
        } catch (e) {
          console.log("Tidak dapat memparsing JSON dari parameter:", e.message);
        }
      }
    } catch (e) {
      console.log("Tidak dapat mendecode input data:", e.message);
    }
    
    // 4. Mencari event logs
    console.log("\nMencari event logs...");
    let foundEvents = false;
    
    for (const log of receipt.logs) {
      try {
        const iface = new ethers.Interface(contractABI);
        const parsedLog = iface.parseLog({
          topics: log.topics,
          data: log.data,
        });
        
        if (parsedLog && parsedLog.name === "CertificateIssued") {
          foundEvents = true;
          console.log("\n== EVENT CERTIFICATE ISSUED ==");
          console.log("- Token ID:", parsedLog.args.tokenId.toString());
          console.log("- Unique Hash:", parsedLog.args.uniqueHash);
          console.log("- Project ID:", parsedLog.args.projectId);
          
          // Coba ambil data sertifikat dari blockchain
          try {
            const certData = await carbonContract.getCertificateByHash(parsedLog.args.uniqueHash);
            console.log("\n== DATA SERTIFIKAT DARI BLOCKCHAIN ==");
            console.log("- Carbon Amount:", certData.carbonAmount.toString());
            console.log("- Issue Date:", new Date(Number(certData.issueDate) * 1000).toISOString());
            console.log("- Project Data:", certData.projectData);
          } catch (e) {
            console.log("Tidak dapat mengambil data sertifikat:", e.message);
          }
        }
      } catch (e) {
        // Skip logs yang tidak dapat di-parse
      }
    }
    
    if (!foundEvents) {
      console.log("Tidak ditemukan event CertificateIssued dalam logs");
    }
    
    console.log("\n=== VERIFIKASI SELESAI ===");
    return { success: true };
  } catch (error) {
    console.error("Error verifying blockchain data:", error);
    return { success: false, error: error.message };
  }
}

// Run dengan transaction hash dari console log aplikasi
if (process.argv.length < 3) {
  console.log("Gunakan: node verifyBlockchainData.js <transaction-hash>");
} else {
  verifyBlockchainData(process.argv[2]);
}