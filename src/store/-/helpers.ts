/**
 * 增强 vuex 中的 module 的key，因为这些 module 都有 namespace，所以外界如果要用的话一定要加上 namespace。
 * @param keys
 * @param prefix
 */
export function augmentKeys<T> (keys: T, prefix: string): T {
  const ret: any = {}

  for (const key in keys) {
    if (!Object.prototype.hasOwnProperty.call(keys, key)) continue

    ret[key] = `${prefix}/${keys[key]}`
  }

  return ret
}
