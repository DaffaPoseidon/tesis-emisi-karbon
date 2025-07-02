# koperasi

## Getting started

# Wallet Service

## Configuration

Create database postgresql with name `wallet`

Open new terminal in `services/wallet` directory

Instalation dependencies

```shell
npm install
```

Copy .env.example to .env

```shell
cp .env.example .env
```

Set your database configuration in .env

generate secret key for `API_KEY` with command

```shell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> Note:
> API_KEY Backend Service and Wallet Service must be the same

## Run project

Migration database

```shell
npm run migrate:fresh
```

Run project

```shell
npm run dev
```

# Smart Contract Service

## Configuration

Open new terminal in `services/smartcontract` directory

Instalation dependencies

```shell
npm install
```

## Run project

Run localhost network hardhat (network blockchain for development)

```shell
npx hardhat node
```

Open new terminal again in `services/smartcontract` directory

Deploy

```shell
npx hardhat ignition deploy ./ignition/modules/Deploy.ts --network localhost
```

# Backend Service

## Configuration

Create database postgresql with name `koperasi`

Open new terminal in  `services/backend` directory

Instalation dependencies

```shell
npm install
```

Copy .env.example to .env

```shell
cp .env.example .env
```

Set your database configuration in .env

generate secret key for `JWT_SECRET` with command

```shell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set `contractABI.json` with contract abi after compile contract

set `PRIVATE_KEY=" "` with private key wallet blockchain

Set `CONTRACT_ADDRESS=" "` with contract address after deploy contract

## Run project

Migration database

```shell
npm run migrate:fresh
```

Seed fake data

```shell
npm run db:seed
```

Run project

```shell
npm run dev
```

# Frontend Service

## Configuration

Open new terminal in `services/frontend` directory

Instalation dependencies

```shell
npm install
```

Copy .env.example to .env

```shell
cp .env.example .env
```

set `API_BASE_URL` with backend service url
example: `API_BASE_URL=http://localhost:3000`

generate `SECRET_COOKIE_PASSWORD` with command

```shell
openssl rand -base64 32
```

## Run project

Run project

```shell
npm run dev
```

# Import Postman Collection

create new workspace in postman

extract `api-docs/postman-koperasi-blockchain.zip`

import postman collection and environment in directory `postman-koperasi-blockchain` to your postman