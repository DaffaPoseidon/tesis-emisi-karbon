const fs = require('fs');
const path = require('path');
const solc = require('solc');

// 1. Path ke file kontrak (gunakan MyContract.sol)
const contractPath = path.resolve(__dirname, 'MyContract.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// 2. Kompilasi
const input = {
  language: 'Solidity',
  sources: {
    'MyContract.sol': {  // Tetap gunakan nama file asli
      content: source
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

// 3. Handle error kompilasi
if (output.errors) {
  console.error('Error kompilasi:');
  output.errors.forEach(err => console.error(err.formattedMessage));
  process.exit(1);
}

// 4. Buat direktori build jika belum ada
const buildPath = path.resolve(__dirname, '../build');
if (!fs.existsSync(buildPath)) {
  fs.mkdirSync(buildPath);
}

// 5. Ambil kontrak SimpleStorage dari file MyContract.sol
const contract = output.contracts['MyContract.sol'].SimpleStorage;

// 6. Simpan output
fs.writeFileSync(
  path.resolve(buildPath, 'SimpleStorageABI.json'),
  JSON.stringify(contract.abi, null, 2)  // Format rapi dengan indentasi 2
);

fs.writeFileSync(
  path.resolve(buildPath, 'SimpleStorageBytecode.json'),
  JSON.stringify(contract.evm.bytecode.object, null, 2)
);

console.log('✅ Kompilasi berhasil!');
console.log('📁 ABI tersimpan di: ' + path.resolve(buildPath, 'SimpleStorageABI.json'));
console.log('📦 Bytecode tersimpan di: ' + path.resolve(buildPath, 'SimpleStorageBytecode.json'));