import { LangDict } from './default'

export default {
  es_ES: {
    // main.ts
    1: 'Cliente del túnel Cloudflare',
    2: 'El cliente del túnel Cloudflare está ejecutándose',
    3: 'El cliente del túnel Cloudflare no está ejecutándose',

    // interfaces.ts
    100: 'Métricas',
    101: 'Endpoint de métricas Prometheus',
  },
  de_DE: {
    // main.ts
    1: 'Cloudflare-Tunnel-Client',
    2: 'Cloudflare-Tunnel-Client läuft',
    3: 'Cloudflare-Tunnel-Client läuft nicht',

    // interfaces.ts
    100: 'Metriken',
    101: 'Prometheus-Metrik-Endpunkt',
  },
  pl_PL: {
    // main.ts
    1: 'Klient tunelu Cloudflare',
    2: 'Klient tunelu Cloudflare jest uruchomiony',
    3: 'Klient tunelu Cloudflare nie jest uruchomiony',

    // interfaces.ts
    100: 'Metryki',
    101: 'Endpoint metryk Prometheus',
  },
  fr_FR: {
    // main.ts
    1: 'Client de tunnel Cloudflare',
    2: 'Le client de tunnel Cloudflare est en cours d\'exécution',
    3: 'Le client de tunnel Cloudflare n\'est pas en cours d\'exécution',

    // interfaces.ts
    100: 'Métriques',
    101: 'Point de terminaison des métriques Prometheus',
  },
} satisfies Record<string, LangDict>
