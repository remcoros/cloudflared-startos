import { VersionInfo } from '@start9labs/start-sdk'

export const v2026_5_0 = VersionInfo.of({
  version: '2026.5.0:1',
  releaseNotes: {
    en_US: 'Updated to cloudflared 2026.5.0',
    es_ES: 'Actualizado a cloudflared 2026.5.0',
    de_DE: 'Auf cloudflared 2026.5.0 aktualisiert',
    pl_PL: 'Zaktualizowano do cloudflared 2026.5.0',
    fr_FR: 'Mis à jour vers cloudflared 2026.5.0',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
