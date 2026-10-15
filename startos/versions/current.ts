import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.10.0:0',
  releaseNotes: {
    en_US:
      'Updated cloudflared to 2026.10.0 with security fixes, improved QUIC error reporting, and cancellation of QUIC reads when request bodies close. Prevents a restart during startup from leaving the previous tunnel process running. [Full upstream changelog](https://github.com/cloudflare/cloudflared/blob/2026.10.0/RELEASE_NOTES).',
    es_ES:
      'Actualizado cloudflared a 2026.10.0 con correcciones de seguridad, mejoras en los informes de errores de QUIC y cancelación de lecturas QUIC al cerrarse los cuerpos de las solicitudes. Evita que un reinicio durante el arranque deje en ejecución el proceso anterior del túnel. [Registro completo de cambios del proyecto](https://github.com/cloudflare/cloudflared/blob/2026.10.0/RELEASE_NOTES).',
    de_DE:
      'cloudflared auf 2026.10.0 aktualisiert: Sicherheitskorrekturen, verbesserte QUIC-Fehlermeldungen und Abbruch von QUIC-Lesevorgängen, wenn Anfragekörper geschlossen werden. Verhindert, dass bei einem Neustart während des Startvorgangs der vorherige Tunnelprozess weiterläuft. [Vollständiges Upstream-Änderungsprotokoll](https://github.com/cloudflare/cloudflared/blob/2026.10.0/RELEASE_NOTES).',
    pl_PL:
      'Zaktualizowano cloudflared do 2026.10.0: poprawki bezpieczeństwa, lepsze raportowanie błędów QUIC oraz anulowanie odczytów QUIC po zamknięciu treści żądań. Zapobiega pozostawieniu poprzedniego procesu tunelu po restarcie w trakcie uruchamiania. [Pełna lista zmian projektu](https://github.com/cloudflare/cloudflared/blob/2026.10.0/RELEASE_NOTES).',
    fr_FR:
      'Mise à jour de cloudflared vers 2026.10.0 avec des correctifs de sécurité, un meilleur signalement des erreurs QUIC et l’annulation des lectures QUIC à la fermeture du corps des requêtes. Empêche un redémarrage pendant le démarrage de laisser tourner le processus précédent du tunnel. [Journal complet des modifications du projet](https://github.com/cloudflare/cloudflared/blob/2026.10.0/RELEASE_NOTES).',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

export const CLOUDFLARED_VERSION = '2026.10.0'
