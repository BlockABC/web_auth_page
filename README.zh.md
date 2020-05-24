# Web Auth Page

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

[README](README.md) | [中文文档](README.zh.md)


## Introduction

Web Auth Page 是 Web Auth 框架的前端，必须配合 [Web Auth Server] 一起使用。 Web Auth Page 利用 [Nuxt] 框架提供了一个方便植入各种 Dapp 的简易钱包。通过 OAuth 登陆后，用户将能够通过 Web Auth Page 进行简单的公私钥对管理、交易构建、签名等操作。


## Getting started

### 环境搭建

首先你需要在环境中搭建 [Nodejs] 服务，[Nodejs] 的安装方式详见官方文档: https://nodejs.org/en/download/package-manager 。然后你需要搭建并启动 [Web Auth Server] 服务。

### 配置环境变量

你可以通过任何熟悉的方式来配置环境变量，比如 CI 和 [PM2] 都有自己的环境变量配置方式，除此以外可以使用 [dotenv](https://github.com/motdotla/dotenv) 进行配置。将项目目录下的 `.env.example` 复制粘贴并重命名为 `.env` ，然后按需配置即可。

### 启动服务

```shell
npm install --only=prod
npm run start
```

### 在你的 Dapp 中使用

Web Auth Page 预期的运行环境是在 Dapp 页面中的一个 iframe 中，为此我们在 [Web Auth SDK] 中创建了一个展示运行原理的 Dapp 示例，通过它你能够对整个系统有一个比较直观的了解。


## API

> 我们推荐通过 [Web Auth SDK] 来调用 API ，因为它已经将 API 封装为了简单易用的异步方法，你不在需要关心通信的细节。**只有当你需要扩充或兼容这些 API 时，你才需要仔细阅读接下来的 API 描述文档。**

本服务为 [Web Auth SDK] 提供了几个基于 `window.postMessage` 的 API，当 Web Auth Page 以 iframe 的形式接入你的 Dapp 后，就可以通过 `iframe.contentWindow.postMessage` 来调用这些接口。为了实现类似长链接的双向通信方式，我们借鉴 [JSON RPC 2.0](https://www.jsonrpc.org/specification) 定义了自己的协议。接下来我们将 Web Auth Page 定义为服务端，[Web Auth SDK] 定义为客户端，然后从几个基础的数据结构开始介绍这个协议。

### Specification

#### Request

每个 Request 发出后，都会等待相同 ID 的 Response ，默认定义的等待超时期限为 5 分钟。

```typescript
interface IRequestMessage {
  channel: string,  // 只有 channel 相同的客户端和服务端之间可以通信，各端都可以同时监听多个 channel
  id: string, // 指明唯一性，与相同 ID 的 Response 一一对应
  method: string, // 在 MessageHandler.ts 中实现的方法
  params: any, // 方法对应的参数
}
```

> [MessageHandler.ts 源码](src/modules/MessageController.ts)

#### Response

无论哪边收到 Request 后，都必须发送一个相同 ID 的 Response 。

```typescript
interface IResponseMessage {
  channel: string, // 同 Request
  error?: IError, // 如果发生错误，这个字段必须用于存放错误对象
  id: string, // 必须和 Request 的 ID 对应
  result?: any, // 如果处理成功，这个字段必须用于存放返回值
}

interface IError {
  code: number, // 错误编码
  data: any | null, // 错误相关的数据，没有就留空
  message: string, // 给开发人员看的错误描述信息
}
```

#### Notify

如果某个接口永远不返回结果，那么发送给这个接口的消息就必须是 Notify ，和 Request 的唯一不同是没有 ID。

```typescript
interface INotifyMessage {
  channel: string,
  method: string,
  params: any,
}
```

### Methods

基于以上的协议，目前实现了以下接口。对于变量的部分就省略具体值，以数据类型表达了。

#### ping

这个接口用来给 Dapp 检查是否和 iframe 中的 Web Auth Page 正确建立了链接，如果这个接口无返回那就说明存在未解决的问题。

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

请求用户进行 OAuth 登陆，并授权 CKB 地址和用户信息的使用。

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
    address: string, // CKB 地址
    nickname: string, // 用户在 SNS 平台上的昵称
    profile: any, // 用户在 SNS 平台上的原始信息
  },
}
```

#### buildTransaction

请求用户构造一笔已签名的交易，适用于简单的转账场景，矿工费可由用户自行决定。

```typescript
// Request
{
  channel: string,
  id: string,
  method: 'buildTransaction',
  params: {
    tos: [
      { address: string, value: string }, // 地址就是 CKB 的收款地址，value 是以 shannon 为单位的金额
      { address: string, value: string },
    ]
  },
}

// Response
{
  channel: string,
  id: string,
  result: {
    signedTransaction: RPC.RawTransaction, // 可用于 https://docs.nervos.org/api/rpc.html#send_transaction 接口的 JSON 对象
  },
}
```

> [RPC.RawTransaction 源码](https://github.com/nervosnetwork/ckb-sdk-js/blob/34d62bb9c86b680e5887194131379c2a01b4f068/packages/ckb-sdk-rpc/types/rpc/index.d.ts#L83-L91)

#### signTransaction

请求用户签名一笔已存在的交易，适用于复杂的交易场景，用户只需确认即可。

```typescript
// Request
{
  channel: string,
  id: string,
  method: 'signTransaction',
  params: {
    unspents: IUTXOUnspent[],
    rawTransaction: RPC.RawTransaction // 未签名
  },
}

// Response
{
  channel: string,
  id: string,
  result: {
    signedTransaction: RPC.RawTransaction, // 可用于 https://docs.nervos.org/api/rpc.html#send_transaction 接口的 JSON 对象
  },
}
```

> 构建未签名交易以及获得 `IUTXOUnspent[]` 需要用到 [One Chain CKB](https://github.com/BlockABC/one_chain_ckb)，这个[示例](https://github.com/BlockABC/one_chain_ckb/blob/d5d441528d40c3769d087572e569abb3e0ab0784/example/node/ckb_create_unsigned_transaction.js#L18-L39)里你可以了解到具体的代码。

#### pushTransaction

通过 RPC 节点推送已签名的交易，无需经过用户同意。

```typescript
// Request
{
  channel: string,
  id: string,
  method: 'pushTransaction',
  params: {
    rawTransaction: RPC.RawTransaction, // 可用于 https://docs.nervos.org/api/rpc.html#send_transaction 接口的 JSON 对象
  },
}

// Response
{
  channel: string,
  id: string,
  result: {
    txId: string, // 交易 ID
  },
}
```


## Development

### 环境搭建

首先你需要搭建并启动 [Web Auth Server] 服务，其次还需要启动 [Web Auth SDK] 的示例。

### 配置环境变量

我们采用了 [dotenv](https://github.com/motdotla/dotenv) 来管理环境变量，请别忘记将项目目录下的 `.env.example` 复制粘贴并重命名为 `.env` ，然后按需配置。

### 启动开发模式

```shell
npm install
npm run dev
```

### 代码风格

我们采用一个稍微修改过的 standardjs 标准: https://github.com/BlockABC/eslint-config-blockabc


## Issues

请随意地前往 [Issues](https://github.com/BlockABC/web_auth_page/issues) 提出你的问题。


## License

[MIT](LICENSE)


[Web Auth Server]: https://github.com/BlockABC/web_auth_server/
[Web Auth SDK]: https://github.com/BlockABC/web_auth_sdk/
[Nodejs]: https://nodejs.org/
[Nuxt]: https://nuxtjs.org/
[PM2]: https://pm2.keymetrics.io/
