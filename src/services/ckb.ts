const rpcnodeConfig = {
  chainId: process.env.CKB_CHAIN_ID,
  chainType: 'ckb',
  baseUrl: process.env.CKB_RPC_URL,
}

const rpcnode = new onechain.core.RPCNode(rpcnodeConfig)

export default {
  chainId: process.env.CKB_CHAIN_ID,
  provider: new onechain.ckb.CKB({ rpcnode }),
  helper: onechain.ckb.helper
}
