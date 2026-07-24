import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { i18n } from '../i18n'

export const v2026_6_1_1 = VersionInfo.of({
  version: '2026.6.1:1',
  releaseNotes: {
    en_US:
      'Adds StartOS 0.4.0-beta.10 and Start SDK 2 compatibility, migrates the admin identity, and repairs Cloudflare routes through live bridge bindings.',
    es_ES:
      'Añade compatibilidad con StartOS 0.4.0-beta.10 y Start SDK 2, migra la identidad de administración y repara las rutas de Cloudflare mediante enlaces dinámicos.',
    de_DE:
      'Fügt Kompatibilität mit StartOS 0.4.0-beta.10 und Start SDK 2 hinzu, migriert die Admin-Identität und repariert Cloudflare-Routen über Live-Bridge-Bindungen.',
    pl_PL:
      'Dodaje zgodność ze StartOS 0.4.0-beta.10 i Start SDK 2, migruje tożsamość administratora i naprawia trasy Cloudflare przez bieżące powiązania mostu.',
    fr_FR:
      'Ajoute la compatibilité avec StartOS 0.4.0-beta.10 et Start SDK 2, migre l’identité administrateur et répare les routes Cloudflare via les liaisons bridge actives.',
  },
  migrations: {
    up: async ({ effects }) => {
      const { store } = await import('../fileModels/store.yaml')
      const conf = await store.read().once()
      if (!conf) return
      const hasIngress = Object.values(conf.ingress).some(Boolean)
      await store.merge(effects, {
        ingress: conf.ingress,
        repairRequired: hasIngress,
        repairMessage: hasIngress
          ? i18n(
              'Cloudflare routes need to be reconnected to their selected StartOS services.',
            )
          : null,
      })
    },
    down: IMPOSSIBLE,
  },
})
