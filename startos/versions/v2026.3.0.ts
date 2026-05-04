import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const v2026_3_0 = VersionInfo.of({
  version: '2026.3.0:2-beta.2',
  releaseNotes: {
    en_US:
      'Cloudflare login and tunnel selection, managed public hostnames via the URL plugin, multi-zone DNS support, import of existing routes, and a Managed Public Routes overview action',
    es_ES:
      'Inicio de sesión en Cloudflare y selección de túnel, hostnames públicos gestionados mediante el plugin de URL, soporte DNS para múltiples zonas, importación de rutas existentes y una acción de resumen de rutas públicas gestionadas',
    de_DE:
      'Cloudflare-Anmeldung und Tunnelauswahl, verwaltete öffentliche Hostnamen über das URL-Plugin, DNS-Unterstützung für mehrere Zonen, Import bestehender Routen und eine Übersichtsaktion für verwaltete öffentliche Routen',
    pl_PL:
      'Logowanie do Cloudflare i wybór tunelu, zarządzane publiczne nazwy hostów przez wtyczkę URL, obsługa DNS dla wielu stref, import istniejących tras oraz akcja przeglądu zarządzanych tras publicznych',
    fr_FR:
      'Connexion à Cloudflare et sélection du tunnel, noms d’hôte publics gérés via le plugin d’URL, prise en charge DNS multi-zones, import des routes existantes et action de vue d’ensemble des routes publiques gérées',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
