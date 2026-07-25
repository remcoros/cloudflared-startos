import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.7.3:1',
  releaseNotes: {
    en_US:
      'Updates Start SDK to 2.0.9, deduplicates SDK copies in package dependencies, and resolves connected service addresses more reliably.',
    es_ES:
      'Actualiza Start SDK a 2.0.9, elimina copias duplicadas del SDK en las dependencias del paquete y resuelve de forma más fiable las direcciones de los servicios conectados.',
    de_DE:
      'Aktualisiert das Start SDK auf 2.0.9, entfernt doppelte SDK-Kopien in den Paketabhängigkeiten und ermittelt die Adressen verbundener Dienste zuverlässiger.',
    pl_PL:
      'Aktualizuje Start SDK do wersji 2.0.9, usuwa zduplikowane kopie SDK z zależności pakietu i pewniej ustala adresy połączonych usług.',
    fr_FR:
      'Met à jour Start SDK vers la version 2.0.9, déduplique les copies du SDK dans les dépendances du paquet et détermine plus fiablement les adresses des services connectés.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})

export const CLOUDFLARED_VERSION = '2026.7.3'
