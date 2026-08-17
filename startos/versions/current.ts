import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.8.2:0',
  releaseNotes: {
    en_US: `Updated cloudflared to 2026.8.2.

Fixes two request-rewriting regressions that upstream shipped in 2026.8.0 and 2026.8.1 and told users not to run: trailing slashes were stripped from requests forwarded to HTTP origins (causing redirect loops in apps that expect canonical trailing-slash URLs), and percent-encoded paths were normalized before being forwarded.

[Full release notes](https://github.com/cloudflare/cloudflared/releases/tag/2026.8.2)`,
    es_ES: `Actualizado cloudflared a 2026.8.2.

Corrige dos regresiones en la reescritura de solicitudes que aparecieron en las versiones 2026.8.0 y 2026.8.1, que el proyecto original desaconsejó usar: se eliminaban las barras finales de las solicitudes reenviadas a orígenes HTTP (provocando bucles de redirección en aplicaciones que esperan URLs canónicas con barra final) y las rutas codificadas en porcentaje se normalizaban antes de reenviarse.

[Notas de la versión completas](https://github.com/cloudflare/cloudflared/releases/tag/2026.8.2)`,
    de_DE: `cloudflared auf 2026.8.2 aktualisiert.

Behebt zwei Regressionen beim Umschreiben von Anfragen aus 2026.8.0 und 2026.8.1, von deren Einsatz das Upstream-Projekt abgeraten hat: Abschließende Schrägstriche wurden aus Anfragen an HTTP-Ursprünge entfernt (was zu Weiterleitungsschleifen in Anwendungen führte, die kanonische URLs mit Schrägstrich erwarten), und prozentkodierte Pfade wurden vor der Weiterleitung normalisiert.

[Vollständige Versionshinweise](https://github.com/cloudflare/cloudflared/releases/tag/2026.8.2)`,
    pl_PL: `Zaktualizowano cloudflared do 2026.8.2.

Naprawia dwie regresje w przepisywaniu żądań z wersji 2026.8.0 i 2026.8.1, przed których używaniem ostrzegał projekt źródłowy: końcowe ukośniki były usuwane z żądań przekazywanych do źródeł HTTP (co powodowało pętle przekierowań w aplikacjach wymagających kanonicznych adresów URL z ukośnikiem), a ścieżki zakodowane procentowo były normalizowane przed przekazaniem.

[Pełne informacje o wydaniu](https://github.com/cloudflare/cloudflared/releases/tag/2026.8.2)`,
    fr_FR: `cloudflared mis à jour vers 2026.8.2.

Corrige deux régressions de réécriture des requêtes introduites en 2026.8.0 et 2026.8.1, que le projet amont déconseillait d’utiliser : les barres obliques finales étaient supprimées des requêtes transmises aux origines HTTP (provoquant des boucles de redirection dans les applications qui attendent des URL canoniques avec barre finale), et les chemins encodés en pourcentage étaient normalisés avant d’être transmis.

[Notes de version complètes](https://github.com/cloudflare/cloudflared/releases/tag/2026.8.2)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

export const CLOUDFLARED_VERSION = '2026.8.2'
