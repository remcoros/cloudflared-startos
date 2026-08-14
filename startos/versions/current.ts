import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.8.1:1',
  releaseNotes: {
    en_US:
      'Update cloudflared to 2026.8.1',
    es_ES:
      'Actualiza cloudflared a 2026.8.1',
    de_DE:
      'Aktualisiert cloudflared auf 2026.8.1',
    pl_PL:
      'Aktualizuje cloudflared do wersji 2026.8.1',
    fr_FR:
      'Met à jour cloudflared vers la version 2026.8.1',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

export const CLOUDFLARED_VERSION = '2026.8.1'
