export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Cloudflare tunnel client': 1,
  'Cloudflare tunnel client is running': 2,
  'Cloudflare tunnel client is not running': 3,

  // interfaces.ts
  'Metrics': 100,
  'Prometheus metrics endpoint': 101,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
