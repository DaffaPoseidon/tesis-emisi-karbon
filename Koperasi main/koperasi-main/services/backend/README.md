# Backend Service

## Configuration

Create database postgresql with name `koperasi`

Go to `services/backend` directory

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
