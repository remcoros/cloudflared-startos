import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.11.0:0',
  releaseNotes: {
    en_US:
      'Updated cloudflared to 2026.11.0, fixing an Access bypass involving matrix parameters. StartOS 0.4.2 or later is required. Details: https://github.com/cloudflare/cloudflared/compare/2026.10.7...2026.11.0 Uninstalling a routed service now removes its Cloudflare route and matching DNS record automatically; incomplete cleanup can be retried with Repair Cloudflare Routes.',
    es_ES:
      'Actualizado cloudflared a 2026.11.0, con una corrección de una omisión de Access mediante parámetros de matriz. Se requiere StartOS 0.4.2 o posterior. Detalles: https://github.com/cloudflare/cloudflared/compare/2026.10.7...2026.11.0 Al desinstalar un servicio enrutado, su ruta de Cloudflare y el registro DNS correspondiente se eliminan automáticamente; la limpieza incompleta se puede reintentar con Reparar rutas de Cloudflare.',
    de_DE:
      'cloudflared auf 2026.11.0 aktualisiert. Eine Umgehung von Access über Matrixparameter wurde behoben. StartOS 0.4.2 oder neuer ist erforderlich. Details: https://github.com/cloudflare/cloudflared/compare/2026.10.7...2026.11.0 Beim Deinstallieren eines Dienstes werden seine Cloudflare-Route und der zugehörige DNS-Eintrag automatisch entfernt. Eine unvollständige Bereinigung kann mit Cloudflare-Routen reparieren erneut versucht werden.',
    pl_PL:
      'Zaktualizowano cloudflared do 2026.11.0, usuwając możliwość obejścia Access za pomocą parametrów macierzowych. Wymagany jest StartOS 0.4.2 lub nowszy. Szczegóły: https://github.com/cloudflare/cloudflared/compare/2026.10.7...2026.11.0 Odinstalowanie usługi automatycznie usuwa jej trasę Cloudflare i pasujący rekord DNS. Niedokończone czyszczenie można ponowić za pomocą Napraw trasy Cloudflare.',
    fr_FR:
      'Mise à jour de cloudflared vers 2026.11.0 : correction d’un contournement d’Access utilisant des paramètres matriciels. StartOS 0.4.2 ou version ultérieure est requis. Détails : https://github.com/cloudflare/cloudflared/compare/2026.10.7...2026.11.0 La désinstallation d’un service supprime automatiquement sa route Cloudflare et son enregistrement DNS correspondant. Réparer les routes Cloudflare permet de réessayer un nettoyage incomplet.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

export const CLOUDFLARED_VERSION = '2026.11.0'
