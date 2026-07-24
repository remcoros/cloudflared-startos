import { VersionInfo } from '@start9labs/start-sdk'

export const v2026_6_1_0 = VersionInfo.of({
  version: '2026.6.1:0',
  releaseNotes: {
    en_US: 'Updated to cloudflared 2026.6.1',
    es_ES: 'Actualizado a cloudflared 2026.6.1',
    de_DE: 'Auf cloudflared 2026.6.1 aktualisiert',
    pl_PL: 'Zaktualizowano do cloudflared 2026.6.1',
    fr_FR: 'Mis à jour vers cloudflared 2026.6.1',
  },
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
