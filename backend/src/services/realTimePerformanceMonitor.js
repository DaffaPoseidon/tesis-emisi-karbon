const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * Service untuk memonitor performa transaksi blockchain secara real-time
 * Dijalankan otomatis saat validator menyetujui proposal
 */
class RealTimePerformanceMonitor {
  constructor() {
    // Log file khusus untuk performance data
    this.logFile = path.join(__dirname, "../../performance-logs.json");
    this.performanceData = this.loadExistingData();
    
    // Flag untuk status monitoring
    this.isMonitoring = false;
    
    // Untuk menyimpan waktu mulai
    this.startTimes = new Map();
    
    // Untuk menyimpan data transaksi yang sedang berjalan
    this.currentTransaction = null;
    
    console.log("[📊 Performance] Monitor initialized silently");
  }
  
  /**
   * Load existing data if available
   */
  loadExistingData() {
    try {
      if (fs.existsSync(this.logFile)) {
        return JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
      }
    } catch (error) {
      // Diam-diam tangani error
    }
    
    // Data baru jika file tidak ada
    return {
      systemInfo: this.getSystemInfo(),
      transactions: [],
      latencyMeasurements: [],
      gasUsage: [],
      summaryStats: {}
    };
  }
  
  /**
   * Simpan data performa ke file
   */
  saveData() {
    try {
      // Hitung summary statistics sebelum menyimpan
      this.calculateSummaryStats();
      
      // Tambahkan timestamp
      this.performanceData.lastUpdated = new Date().toISOString();
      
      fs.writeFileSync(this.logFile, JSON.stringify(this.performanceData, null, 2));
    } catch (error) {
      console.log("[📊 Performance] Error saving data:", error.message);
    }
  }
  
  /**
   * Mendapatkan informasi sistem
   */
  getSystemInfo() {
    let gpuInfo = "Not available";
    
    // Attempt to get GPU info (works only on Linux with lspci)
    try {
      if (os.platform() === 'linux') {
        const { execSync } = require('child_process');
        const gpuData = execSync('lspci | grep -i vga').toString();
        if (gpuData) {
          const gpuMatch = gpuData.match(/VGA compatible controller: (.*?)(?:\(|\[|$)/i);
          if (gpuMatch && gpuMatch[1]) {
            gpuInfo = gpuMatch[1].trim();
          }
        }
      }
    } catch (e) {
      // Silent fail for GPU detection
    }
    
    return {
      platform: os.platform(),
      architecture: os.arch(),
      cpuModel: os.cpus()[0].model,
      cpuCount: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / (1024 * 1024 * 1024)) + " GB",
      gpuInfo,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Start monitoring untuk transaksi blockchain
   * @param {string} transactionId - ID atau deskripsi transaksi (untuk referensi)
   * @param {Object} metadata - Metadata tambahan untuk transaksi
   */
  startTransaction(transactionId, metadata = {}) {
    if (!this.isMonitoring) {
      this.isMonitoring = true;
    }
    
    const startTime = performance.now();
    this.startTimes.set(transactionId, startTime);
    
    // Simpan metadata transaksi saat ini
    this.currentTransaction = {
      id: transactionId,
      startTime,
      metadata,
      miningStartTime: null,
      miningEndTime: null,
      tokenCount: metadata.carbonAmount || 1,
      latency: {
        mining: null,
        confirmation: null
      }
    };
    
    return startTime;
  }
  
  /**
   * Mencatat waktu saat transaksi mulai di-mining
   */
  recordMiningStart() {
    if (!this.currentTransaction) return;
    
    this.currentTransaction.miningStartTime = performance.now();
    return this.currentTransaction.miningStartTime;
  }
  
  /**
   * Mencatat waktu saat transaksi selesai di-mining
   */
  recordMiningEnd() {
    if (!this.currentTransaction || !this.currentTransaction.miningStartTime) return;
    
    this.currentTransaction.miningEndTime = performance.now();
    this.currentTransaction.latency.mining = 
      this.currentTransaction.miningEndTime - this.currentTransaction.miningStartTime;
    
    return this.currentTransaction.latency.mining;
  }
  
  /**
   * End monitoring untuk transaksi blockchain
   * @param {string} transactionId - ID atau deskripsi transaksi
   * @param {Object} txData - Data transaksi blockchain
   */
  endTransaction(transactionId, txData = {}) {
    if (!this.startTimes.has(transactionId)) {
      console.log(`[📊 Performance] No start time for transaction: ${transactionId}`);
      return;
    }
    
    const startTime = this.startTimes.get(transactionId);
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Hitung latency confirmation
    if (this.currentTransaction) {
      this.currentTransaction.latency.confirmation = executionTime;
    }
    
    // Record the transaction untuk transaksi saat ini saja
    const transactionRecord = {
      id: transactionId,
      timestamp: new Date().toISOString(),
      executionTime,
      gasUsed: txData.gasUsed ? txData.gasUsed.toString() : "N/A",
      blockNumber: txData.blockNumber || "N/A",
      transactionHash: txData.hash || txData.transactionHash || "N/A",
      tokenCount: (this.currentTransaction ? this.currentTransaction.tokenCount : 1),
      metadata: txData.metadata || {},
      dataSize: txData.metadata ? Buffer.byteLength(JSON.stringify(txData.metadata), 'utf8') : 0,
      latency: this.currentTransaction ? this.currentTransaction.latency : { mining: null, confirmation: null }
    };
    
    // Reset current transaction tracking
    this.currentTransaction = null;
    
    // Hanya simpan transaksi saat ini, reset transaksi lama
    this.performanceData.transactions = [transactionRecord];
    this.startTimes.delete(transactionId);
    
    // Auto-save after each transaction
    this.saveData();
    
    return executionTime;
  }
  
  /**
   * Mencatat penggunaan gas
   * @param {Object} gasData - Data penggunaan gas
   */
  recordGasUsage(gasData) {
    // Hanya simpan gas usage untuk transaksi saat ini
    this.performanceData.gasUsage = [{
      timestamp: new Date().toISOString(),
      ...gasData
    }];
    
    // Auto-save after recording gas usage
    this.saveData();
  }
  
  /**
   * Mencatat pengukuran latensi
   * @param {Object} latencyData - Data latensi
   */
  recordLatency(latencyData) {
    // Hanya simpan latency untuk transaksi saat ini
    this.performanceData.latencyMeasurements = [{
      timestamp: new Date().toISOString(),
      ...latencyData
    }];
    
    // Auto-save after recording latency
    this.saveData();
  }
  
  /**
   * Menghitung statistik ringkasan dari pengukuran saat ini
   */
  calculateSummaryStats() {
    // Skip if no transactions
    if (this.performanceData.transactions.length === 0) return;
    
    // Ambil transaksi terbaru
    const tx = this.performanceData.transactions[0];
    
    this.performanceData.summaryStats = {
      tokenCount: tx.tokenCount || 1,
      executionTime: {
        value: tx.executionTime,
        perToken: tx.executionTime / (tx.tokenCount || 1)
      },
      gasUsage: tx.gasUsed !== "N/A" ? {
        value: parseInt(tx.gasUsed),
        perToken: Math.floor(parseInt(tx.gasUsed) / (tx.tokenCount || 1))
      } : "No data",
      latency: {
        mining: tx.latency?.mining || null,
        confirmation: tx.latency?.confirmation || null
      },
      dataSize: tx.dataSize || 0
    };
  }
  
  /**
   * Menghapus semua data pengukuran (reset)
   */
  resetData() {
    this.performanceData = {
      systemInfo: this.getSystemInfo(),
      transactions: [],
      latencyMeasurements: [],
      gasUsage: [],
      summaryStats: {}
    };
    
    this.saveData();
    console.log("[📊 Performance] Data reset");
  }
  
  /**
   * Menghasilkan laporan performa lengkap dalam format ASCII tabel
   * @returns {string} - Laporan dalam format teks
   */
  generatePerformanceReport() {
    this.calculateSummaryStats();
    
    if (this.performanceData.transactions.length === 0) {
      return "⚠️ No performance data available yet";
    }

    // Format report as string with ASCII table formatting
    let report = "\n┌─────────────────────────────────────────────────────┐\n";
    report += "│               BLOCKCHAIN PERFORMANCE REPORT             │\n";
    report += "└─────────────────────────────────────────────────────┘\n\n";
    
    // System Info
    report += "SYSTEM INFORMATION:\n";
    report += `• Platform: ${this.performanceData.systemInfo.platform} ${this.performanceData.systemInfo.architecture}\n`;
    report += `• CPU: ${this.performanceData.systemInfo.cpuModel} (${this.performanceData.systemInfo.cpuCount} cores)\n`;
    report += `• Memory: ${this.performanceData.systemInfo.totalMemory}\n`;
    report += `• GPU: ${this.performanceData.systemInfo.gpuInfo}\n\n`;
    
    // Performance Summary
    report += "┌─────────────────────────────────────────────────────┐\n";
    report += "│                 PERFORMANCE SUMMARY                  │\n";
    report += "├─────────────────────────────┬───────────────────────┤\n";
    report += `│ Total Certificates Created  │ ${this.performanceData.summaryStats.tokenCount.toString().padEnd(23)} │\n`;
    report += "├─────────────────────────────┼───────────────────────┤\n";
    
    // Execution Time
    if (this.performanceData.summaryStats.executionTime) {
      report += `│ Total Execution Time (ms)   │ ${this.performanceData.summaryStats.executionTime.value.toFixed(2).padEnd(23)} │\n`;
      report += `│ Time Per Token (ms)         │ ${this.performanceData.summaryStats.executionTime.perToken.toFixed(2).padEnd(23)} │\n`;
    }
    
    // Gas Usage
    if (this.performanceData.summaryStats.gasUsage !== "No data") {
      report += "├─────────────────────────────┼───────────────────────┤\n";
      report += `│ Gas Used (total)            │ ${this.performanceData.summaryStats.gasUsage.value.toFixed(0).padEnd(23)} │\n`;
      report += `│ Gas Per Certificate         │ ${this.performanceData.summaryStats.gasUsage.perToken.toFixed(0).padEnd(23)} │\n`;
    }
    
    // Latency
    if (this.performanceData.summaryStats.latency.mining || 
        this.performanceData.summaryStats.latency.confirmation) {
      report += "├─────────────────────────────┼───────────────────────┤\n";
      report += `│ Mining Latency (ms)         │ ${(this.performanceData.summaryStats.latency.mining || "N/A").toString().padEnd(23)} │\n`;
      report += `│ Confirmation Latency (ms)   │ ${(this.performanceData.summaryStats.latency.confirmation || "N/A").toString().padEnd(23)} │\n`;
    }
    
    // Data Size
    report += "├─────────────────────────────┼───────────────────────┤\n";
    report += `│ Data Size (bytes)           │ ${this.performanceData.summaryStats.dataSize.toString().padEnd(23)} │\n`;
    
    report += "└─────────────────────────────┴───────────────────────┘\n\n";
    
    // Transaction Hash
    if (this.performanceData.transactions[0]?.transactionHash && 
        this.performanceData.transactions[0].transactionHash !== "N/A") {
      report += "TRANSACTION DETAILS:\n";
      report += `• Hash: ${this.performanceData.transactions[0].transactionHash}\n`;
      report += `• Block: ${this.performanceData.transactions[0].blockNumber}\n`;
      report += `• Timestamp: ${this.performanceData.transactions[0].timestamp}\n\n`;
    }
    
    report += "──────────────────── END OF REPORT ────────────────────\n";
    return report;
  }
  
  /**
   * Menghitung rata-rata dari array angka
   */
  calculateAverage(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  
  /**
   * Menghitung standar deviasi dari array angka
   */
  calculateStdDev(values) {
    const avg = this.calculateAverage(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const variance = this.calculateAverage(squareDiffs);
    return Math.sqrt(variance);
  }
}

// Singleton instance
const monitor = new RealTimePerformanceMonitor();

module.exports = monitor;