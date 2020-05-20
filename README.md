# Web Auth Page

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

[README](README.md) | [中文文档](README.zh.md)


## Introduction

The Web Auth Page is the front end of the Web Auth framework and must be used with [Web Auth Server]. Web Auth Page provides a lite wallet easy to embeded in various Dapps using [Nuxt] framework. After logging in through OAuth, users will be able to perform simple keypair management, transaction construction, signature, etc.


## Getting started

### Environment Construction

First you need to set up [Nodejs] service in your server, go to official documentation for how to install: https://nodejs.org/en/download/package-manager . Then you need to set up [Web Auth Server] service.

### Environment Variables

You can configure environment variables in any familiar way, such as CI and [PM2] both have their own way for configure environment variables, except that you can use [dotenv](https://github.com/motdotla/dotenv). Copy and rename the `.env.example` in the project directory to `.env` and configure it as needed.

### Launch Service

```shell
npm install --only=prod
npm run start
```

### Embed in Dapp

Web Auth Page is expected to run in an iframe of Dapp, so we have created a Dapp example in [Web Auth SDK] that shows how it works, so that you can get a more intuitive view of the whole system.


## API

> We recommend calling the API via [Web Auth SDK] because it has encapsulated the API in easy-to-use asynchronous methods, and you don't need to care about the details of communication. **Only if you need to expand or make something compatible with these APIs you should read the following API specification carefully. **

This service provides several APIs for the [Web Auth SDK] based on `window.postMessage`, which can be invoked via `iframe.contentWindow.postMessage` once Web Auth Page is embeded in your Dapp through iframe. In order to implement a full-duplex communication approach similar to persistent connection, we defined a customized specification inspired by  [JSON RPC 2.0](https://www.jsonrpc.org/specification) . Next we define Web Auth Page as the server side and [Web Auth SDK] as the client side, and introduce the protocol starting with a few basic data structures.


### Specification

#### Request

After each Request sent, both side will waiting for a Response with the same ID , default timeout limit is 5 minutes.

```typescript
interface IRequestMessage {
  channel: string,  // Only with the same channel client and server can communicate with each other, and each side can listen to multiple channels simultaneously.
  id: string, // Identity, corresponding to Response with the same ID.
  method: string, // Methods described in next section
  params: any, // Params of methods.
}
```

> All implemented [methods](#methods)

#### Response

No matter which side in receipt of a Request, a Response with the same ID must be sent.

```typescript
interface IResponseMessage {
  channel: string, // Same as Request.
  error?: IError, // If an error occurs, this field must be used to store the error object.
  id: string, // Must correspond to the ID of the Request.
  result?: any, // If it works out, this field must be used to store the return value.
}

interface IError {
  code: number, // error code
  data: any | null, // data of error, could be null
  message: string, // error description for developers
}
```

#### Notify

If an method never returns, then the message invoke that method must be sent as Notify, the only difference from Request is that there is no ID.

```typescript
interface INotifyMessage {
  channel: string,
  method: string,
  params: any,
}
```

### Methods

Based on the above specification, the following methods are currently implemented. For variables, values are expressed as data types.

#### ping

This method is for checking if Dapp can communicate with Web Auth Page in the iframe properly, if the method does not return then there must be an unresolved issue.

```typescript
// Request
{
  channel: string,
  id: string,
  method: 'ping',
  params: null,
}

// Response
{
  channel: string,
  id: string,
  result: 'pong',
}
```

#### signIn

Ask the user to OAuth login and authorizes the use of the CKB address and user information.

```typescript
// Request
{
  channel: string,
  id: string,
  method: 'signIn',
  params: null,
}

// Response
{
  channel: string,
  id: string,
  result: {
    address: string, // address of CKB
    nickname: string, // user's nickname on SNS
    profile: any, // user's original profile on SNS
  },
}
```

#### buildTransaction

Ask user to construct a signed transaction, useful for simple transfer scenario, the miner fee can be determined by user themselves.

```typescript
// Request
{
  channel: string,
  id: string,
  method: 'buildTransaction',
  params: {
    tos: [
      { address: string, value: string }, // address is CKB address, value is amount in shannon
      { address: string, value: string },
    ]
  },
}

// Response
{
  channel: string,
  id: string,
  result: {
    signedTransaction: RPC.RawTransaction, // JSON object available for RPC API https://docs.nervos.org/api/rpc.html#send_transaction
  },
}
```

> [Source code of RPC.RawTransaction](https://github.com/nervosnetwork/ckb-sdk-js/blob/34d62bb9c86b680e5887194131379c2a01b4f068/packages/ckb-sdk-rpc/types/rpc/index.d.ts#L83-L91)

#### signTransaction

Ask user to sign an existing unsigned transaction, useful for complex trading scenario, the user only need to confirm the transaction.


```typescript
// Request
{
  channel: string,
  id: string,
  method: 'signTransaction',
  params: {
    unspents: IUTXOUnspent[],
    rawTransaction: RPC.RawTransaction // unsigned
  },
}

// Response
{
  channel: string,
  id: string,
  result: {
    signedTransaction: RPC.RawTransaction, // JSON object available for RPC API https://docs.nervos.org/api/rpc.
  },
}
```

> Constructing unsigned transactions and obtaining `IUTXOUnspent[]` requires the use of [One Chain CKB](https://github.com/BlockABC/one_chain_ckb), which you can learn about in this [example](https://github.com/BlockABC/one_chain_ckb/blob/d5d441528d40c3769d087572e569abb3e0ab0784/example/node/ckb_create_unsigned_transaction.js#L18-L39).


## Development

### Environment Construction

First you need to set up and start the [Web Auth Server] service, and then you need to run the example of  [Web Auth SDK].

### Environment Variables

We used [dotenv](https://github.com/motdotla/dotenv) to manage the environment variables, do not forget to copy and rename the `.env.example` in the project directory to `.env` and configure it as needed.


### Launch Development Mode

```shell
npm install
npm run dev
```

### Code Style

We use a little tweaked version of standardjs: https://github.com/BlockABC/eslint-config-blockabc


## Issues

Please feel free to submit your questions at [Issues](https://github.com/BlockABC/web_auth_page/issues).


## License

[MIT](LICENSE)


[Web Auth Server]: https://github.com/BlockABC/web_auth_server/
[Web Auth SDK]: https://github.com/BlockABC/web_auth_sdk/
[Nodejs]: https://nodejs.org/
[Nuxt]: https://nuxtjs.org/
[PM2]: https://pm2.keymetrics.io/
