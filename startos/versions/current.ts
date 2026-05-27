import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.5.0:1',
  releaseNotes: {
    en_US:
      'Updated to cloudflared 2026.5.0; flatten routes directly under zone in Managed Public Routes',
    es_ES:
      'Actualizado a cloudflared 2026.5.0; rutas mostradas directamente bajo la zona en Rutas Públicas Gestionadas',
    de_DE:
      'Auf cloudflared 2026.5.0 aktualisiert; Routen werden direkt unter der Zone in Verwalteten Öffentlichen Routen angezeigt',
    pl_PL:
      'Zaktualizowano do cloudflared 2026.5.0; trasy wyświetlane bezpośrednio pod strefą w Zarządzanych Trasach Publicznych',
    fr_FR:
      'Mis à jour vers cloudflared 2026.5.0 ; routes affichées directement sous la zone dans les Routes Publiques Gérées',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
