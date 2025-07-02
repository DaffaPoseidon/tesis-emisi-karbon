# Wallet Service

## Configuration

Create database postgresql with name `wallet`

Go to `services/wallet` directory

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

Seed fake data

```shell
npm run db:seed
```

Run project

```shell
npm run dev
```
