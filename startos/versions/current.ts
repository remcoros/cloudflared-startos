import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.10.3:1',
  releaseNotes: {
    en_US:
      'Managed Cloudflare routes now follow changes to a service’s assigned port automatically, without restarting the tunnel. Routes added while Cloudflare Tunnel is running are watched too.',
    es_ES:
      'Las rutas de Cloudflare gestionadas ahora siguen automáticamente los cambios del puerto asignado a un servicio, sin reiniciar el túnel. También se supervisan las rutas añadidas mientras Cloudflare Tunnel está en ejecución.',
    de_DE:
      'Verwaltete Cloudflare-Routen folgen Änderungen am zugewiesenen Port eines Dienstes jetzt automatisch, ohne den Tunnel neu zu starten. Auch Routen, die während des Betriebs von Cloudflare Tunnel hinzugefügt werden, werden überwacht.',
    pl_PL:
      'Zarządzane trasy Cloudflare automatycznie śledzą zmiany portu przypisanego do usługi, bez ponownego uruchamiania tunelu. Monitorowane są także trasy dodane podczas działania Cloudflare Tunnel.',
    fr_FR:
      'Les routes Cloudflare gérées suivent désormais automatiquement les changements du port attribué à un service, sans redémarrer le tunnel. Les routes ajoutées pendant le fonctionnement de Cloudflare Tunnel sont également surveillées.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

export const CLOUDFLARED_VERSION = '2026.10.3'
