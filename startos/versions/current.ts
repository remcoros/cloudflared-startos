import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.11.0:0',
  releaseNotes: {
    en_US:
      'Updated cloudflared to 2026.11.0, fixing an Access bypass involving matrix parameters. StartOS 0.4.2 or later is required. Details: https://github.com/cloudflare/cloudflared/compare/2026.10.7...2026.11.0',
    es_ES:
      'Actualizado cloudflared a 2026.11.0, con una corrección de una omisión de Access mediante parámetros de matriz. Se requiere StartOS 0.4.2 o posterior. Detalles: https://github.com/cloudflare/cloudflared/compare/2026.10.7...2026.11.0',
    de_DE:
      'cloudflared auf 2026.11.0 aktualisiert. Eine Umgehung von Access über Matrixparameter wurde behoben. StartOS 0.4.2 oder neuer ist erforderlich. Details: https://github.com/cloudflare/cloudflared/compare/2026.10.7...2026.11.0',
    pl_PL:
      'Zaktualizowano cloudflared do 2026.11.0, usuwając możliwość obejścia Access za pomocą parametrów macierzowych. Wymagany jest StartOS 0.4.2 lub nowszy. Szczegóły: https://github.com/cloudflare/cloudflared/compare/2026.10.7...2026.11.0',
    fr_FR:
      'Mise à jour de cloudflared vers 2026.11.0 : correction d’un contournement d’Access utilisant des paramètres matriciels. StartOS 0.4.2 ou version ultérieure est requis. Détails : https://github.com/cloudflare/cloudflared/compare/2026.10.7...2026.11.0',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

export const CLOUDFLARED_VERSION = '2026.11.0'
