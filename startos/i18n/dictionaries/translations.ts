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

    // actions/setToken.ts
    200: 'Token de autenticación',
    201: 'El token de autenticación para tu túnel Cloudflare.',
    202: 'Establecer token de autenticación',
    203: 'Establecer el token de autenticación para tu túnel Cloudflare.',
  },
  de_DE: {
    // main.ts
    1: 'Cloudflare-Tunnel-Client',
    2: 'Cloudflare-Tunnel-Client läuft',
    3: 'Cloudflare-Tunnel-Client läuft nicht',

    // interfaces.ts
    100: 'Metriken',
    101: 'Prometheus-Metrik-Endpunkt',

    // actions/setToken.ts
    200: 'Authentifizierungstoken',
    201: 'Das Authentifizierungstoken für Ihren Cloudflare-Tunnel.',
    202: 'Authentifizierungstoken festlegen',
    203: 'Legen Sie das Authentifizierungstoken für Ihren Cloudflare-Tunnel fest.',
  },
  pl_PL: {
    // main.ts
    1: 'Klient tunelu Cloudflare',
    2: 'Klient tunelu Cloudflare jest uruchomiony',
    3: 'Klient tunelu Cloudflare nie jest uruchomiony',

    // interfaces.ts
    100: 'Metryki',
    101: 'Endpoint metryk Prometheus',

    // actions/setToken.ts
    200: 'Token uwierzytelniania',
    201: 'Token uwierzytelniania dla twojego tunelu Cloudflare.',
    202: 'Ustaw token uwierzytelniania',
    203: 'Ustaw token uwierzytelniania dla twojego tunelu Cloudflare.',
  },
  fr_FR: {
    // main.ts
    1: 'Client de tunnel Cloudflare',
    2: 'Le client de tunnel Cloudflare est en cours d\'exécution',
    3: 'Le client de tunnel Cloudflare n\'est pas en cours d\'exécution',

    // interfaces.ts
    100: 'Métriques',
    101: 'Point de terminaison des métriques Prometheus',

    // actions/setToken.ts
    200: 'Jeton d\'authentification',
    201: 'Le jeton d\'authentification pour votre tunnel Cloudflare.',
    202: 'Définir le jeton d\'authentification',
    203: 'Définissez le jeton d\'authentification pour votre tunnel Cloudflare.',
  },
} satisfies Record<string, LangDict>
