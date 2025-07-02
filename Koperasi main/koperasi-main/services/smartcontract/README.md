# Smart Contract Service

## Configuration

Go to `services/smartcontract` directory

Instalation dependencies

```shell
npm install
```

## Run project

Compile

```shell
npx hardhat compile
```

Copy abi in `artifacts/contracts/ProjectToken.sol/ProjectToken.json` to `contractABI.json` in `services/backend` directory

Run localhost network hardhat (network blockchain for development)

```shell
npx hardhat node
```

Open new terminal

Deploy

```shell
npx hardhat ignition deploy ./ignition/modules/Deploy.ts --network localhost
```
