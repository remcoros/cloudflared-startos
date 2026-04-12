import { LangDict } from './default'

export default {
  es_ES: {
    // main.ts
    1: 'Túnel Cloudflare',
    2: 'El túnel Cloudflare está ejecutándose',
    3: 'El túnel Cloudflare no está ejecutándose',

    // interfaces.ts
    100: 'Métricas',
    101: 'Endpoint de métricas Prometheus',
  },
  de_DE: {
    // main.ts
    1: 'Cloudflare-Tunnel',
    2: 'Cloudflare-Tunnel läuft',
    3: 'Cloudflare-Tunnel läuft nicht',

    // interfaces.ts
    100: 'Metriken',
    101: 'Prometheus-Metrik-Endpunkt',
  },
  pl_PL: {
    // main.ts
    1: 'Tunel Cloudflare',
    2: 'Tunel Cloudflare jest uruchomiony',
    3: 'Tunel Cloudflare nie jest uruchomiony',

    // interfaces.ts
    100: 'Metryki',
    101: 'Endpoint metryk Prometheus',
  },
  fr_FR: {
    // main.ts
    1: 'Tunnel Cloudflare',
    2: 'Le client de tunnel Cloudflare est en cours d\'exécution',
    3: 'Le client de tunnel Cloudflare n\'est pas en cours d\'exécution',

    // interfaces.ts
    100: 'Métriques',
    101: 'Point de terminaison des métriques Prometheus',
  },
} satisfies Record<string, LangDict>
