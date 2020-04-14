/**
 * 剔除 hex 字符串前缀
 * @param {string} str
 * @returns {string}
 */
export function stripHexPrefix (str = ''): string {
  return str.startsWith('0x') ? str.slice(2) : str
}
