import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.7.3:0',
  releaseNotes: {
    en_US:
      'Updates cloudflared to 2026.7.3 with QUIC precheck improvements and dependency security fixes. Full changes: https://github.com/cloudflare/cloudflared/compare/2026.6.1...2026.7.3',
    es_ES:
      'Actualiza cloudflared a 2026.7.3 con mejoras en las comprobaciones previas de QUIC y correcciones de seguridad en dependencias. Cambios completos: https://github.com/cloudflare/cloudflared/compare/2026.6.1...2026.7.3',
    de_DE:
      'Aktualisiert cloudflared auf 2026.7.3 mit verbesserten QUIC-Vorabprüfungen und Sicherheitskorrekturen für Abhängigkeiten. Vollständige Änderungen: https://github.com/cloudflare/cloudflared/compare/2026.6.1...2026.7.3',
    pl_PL:
      'Aktualizuje cloudflared do wersji 2026.7.3, dodając ulepszenia wstępnych kontroli QUIC i poprawki bezpieczeństwa zależności. Pełna lista zmian: https://github.com/cloudflare/cloudflared/compare/2026.6.1...2026.7.3',
    fr_FR:
      'Met à jour cloudflared vers 2026.7.3 avec des améliorations des vérifications préalables QUIC et des correctifs de sécurité pour les dépendances. Modifications complètes : https://github.com/cloudflare/cloudflared/compare/2026.6.1...2026.7.3',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

export const CLOUDFLARED_VERSION = '2026.7.3'
