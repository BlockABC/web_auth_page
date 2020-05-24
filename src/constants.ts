export const LOG_LEVEL = {
  error: 0,
  warn: 1,
  info: 3,
  debug: 4,
  trace: 5,
  silent: Infinity
}

export const CACHE = {
  ckb: {
    keypair: 'ckb.keypair',
    nickname: 'ckb.nickname',
    passwdHash: 'cbk.passwdHash',
    profile: 'ckb.profile',
  },
  page: {
    buildTransaction: 'page.build-transaction',
    signTransaction: 'page.sign-transaction',
  },
}
