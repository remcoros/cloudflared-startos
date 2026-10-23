import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.10.3:0',
  releaseNotes: {
    en_US:
      'Updated cloudflared to 2026.10.3 with Go security updates and a fix for truncated messages larger than the read buffer. Refreshed the Debian 13.7 slim container base and updated the StartOS SDK. [Full upstream changelog](https://github.com/cloudflare/cloudflared/blob/2026.10.3/RELEASE_NOTES).',
    es_ES:
      'Actualizado cloudflared a 2026.10.3 con actualizaciones de seguridad de Go y una corrección para los mensajes truncados al superar el tamaño del búfer de lectura. Renovada la imagen base Debian 13.7 slim y actualizado el SDK de StartOS. [Registro completo de cambios del proyecto](https://github.com/cloudflare/cloudflared/blob/2026.10.3/RELEASE_NOTES).',
    de_DE:
      'cloudflared auf 2026.10.3 aktualisiert: Go-Sicherheitsupdates und eine Korrektur für abgeschnittene Nachrichten, die größer als der Lesepuffer sind. Die Containerbasis Debian 13.7 slim und das StartOS-SDK wurden aktualisiert. [Vollständiges Upstream-Änderungsprotokoll](https://github.com/cloudflare/cloudflared/blob/2026.10.3/RELEASE_NOTES).',
    pl_PL:
      'Zaktualizowano cloudflared do 2026.10.3: aktualizacje bezpieczeństwa Go i poprawka obcinania wiadomości większych niż bufor odczytu. Odświeżono bazowy obraz kontenera Debian 13.7 slim i zaktualizowano SDK StartOS. [Pełna lista zmian projektu](https://github.com/cloudflare/cloudflared/blob/2026.10.3/RELEASE_NOTES).',
    fr_FR:
      'Mise à jour de cloudflared vers 2026.10.3 avec des mises à jour de sécurité de Go et une correction des messages tronqués lorsqu’ils dépassent la taille du tampon de lecture. Actualisation de l’image de base Debian 13.7 slim et du SDK StartOS. [Journal complet des modifications du projet](https://github.com/cloudflare/cloudflared/blob/2026.10.3/RELEASE_NOTES).',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

export const CLOUDFLARED_VERSION = '2026.10.3'
