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

    // actions/cloudflareLogin.ts
    200: 'Iniciar sesión en Cloudflare',
    201: 'Agregar zona DNS',
    202: 'Autentica con una zona DNS de Cloudflare. Ejecuta esta acción de nuevo para agregar zonas adicionales.',
    209: 'Un nombre para tu nuevo túnel Cloudflare.',

    // actions/selectTunnel.ts
    210: 'Túnel Cloudflare: No seleccionado',
    211: 'Elige qué túnel Cloudflare usa este servidor. Puedes seleccionar un túnel existente o crear uno nuevo.',
    212: 'Inicia sesión en Cloudflare primero para configurar una zona',

    // actions/removeZone.ts
    220: 'Eliminar zona DNS',
    221: 'Elimina una zona DNS de Cloudflare de este paquete. Los nombres de host existentes en esa zona pueden seguir funcionando, pero este paquete ya no gestionará sus rutas DNS ni del túnel.',
    222: 'Los registros DNS y las reglas de entrada existentes en Cloudflare NO serán eliminados.',
    223: 'No hay zonas configuradas',

    // actions/addPublicHostname.ts
    230: 'Agregar nombre de host público',
    231: 'Enruta un nombre de host público de Cloudflare a este servicio',
    232: 'Subdominio',
    233: 'El subdominio para enrutar a este servicio (p. ej. miapp).',
    234: 'Solo subdominio, sin puntos (p. ej. miapp)',
    235: 'Dominio',
    236: 'Inicia sesión en Cloudflare para ver tus dominios',
    237: 'Sin zona configurada',
    238: 'Inicia sesión en Cloudflare primero (ejecuta la acción "Iniciar sesión en Cloudflare") para configurar una zona DNS.',
    239: 'Sin túnel configurado',
    240: 'Selecciona primero un túnel de Cloudflare (ejecuta la acción "Túnel Cloudflare").',
    241: 'Nombre de host público agregado',
    242: 'Registro DNS creado automáticamente.',
    243: 'Agrega un registro CNAME manualmente en el panel de Cloudflare (con proxy).',

    // actions/importPublicHostnames.ts
    260: 'Importar nombres de host públicos',
    261: 'Escanea los nombres de host públicos existentes en tu túnel Cloudflare y agrega URLs a los servicios instalados coincidentes.',
    262: 'Esto escaneará los nombres de host públicos existentes del túnel Cloudflare y agregará URLs a los servicios instalados coincidentes.',
    263: 'No se encontraron nuevos nombres de host públicos en Cloudflare que no estén ya registrados.',
    264: 'Inicia sesión en una zona DNS de Cloudflare de la misma cuenta que el túnel seleccionado y vuelve a intentarlo.',

    // actions/deletePublicHostname.ts
    250: 'Eliminar nombre de host público',
    251: 'Elimina una ruta de nombre de host público de Cloudflare',
    252: 'Esto eliminará este nombre de host de tu túnel Cloudflare y el registro DNS de Cloudflare.',

    // actions/managedOverview.ts
    270: 'Rutas públicas administradas',
    271: 'Muestra las zonas DNS, el túnel y las rutas de aplicaciones de Cloudflare administradas actualmente por este paquete.',
    272: 'Muestra las zonas DNS, el túnel y los nombres de host públicos administrados actualmente por este paquete.',
    273: 'Túnel Cloudflare',
    274: 'Ningún túnel seleccionado',
    275: 'Nombre del túnel',
    276: 'ID del túnel',
    277: 'ID de la cuenta',
    278: 'Zonas DNS configuradas',
    279: 'No hay zonas DNS configuradas',
    280: 'Nombre de dominio',
    281: 'ID de zona',
    282: 'Nombres de host administrados',
    283: 'Rutas de aplicaciones administradas',
    284: 'Actualmente no hay nombres de host públicos administrados',
    285: 'URL pública',
    286: 'Paquete',
    287: 'Servidor StartOS',
    288: 'Zona DNS',
    289: 'ID de interfaz',
    290: 'Destino interno',
    291: 'Rutas de la aplicación',
    292: 'Actualmente no se gestionan rutas de aplicación en esta zona',
    300: 'Reparar rutas de Cloudflare',
    301: 'Vuelve a conectar las rutas de Cloudflare gestionadas con los servicios de StartOS seleccionados.',
    302: 'Rutas de Cloudflare reparadas',
    303: 'Las rutas de Cloudflare gestionadas se actualizaron correctamente.',
    304: 'Error al reparar las rutas de Cloudflare',
    305: 'Las rutas de Cloudflare no se pudieron actualizar de forma segura. Revisa los registros del servicio y vuelve a intentarlo.',
    306: 'Inicia sesión en Cloudflare para configurar una zona DNS',
    307: 'Selecciona o crea un túnel de Cloudflare para este servidor',
    308: 'Las rutas de Cloudflare deben volver a conectarse con los servicios de StartOS seleccionados.',
    309: 'No hay credenciales de zona de Cloudflare disponibles para reparar las rutas del túnel.',
  },
  de_DE: {
    // main.ts
    1: 'Cloudflare-Tunnel',
    2: 'Cloudflare-Tunnel läuft',
    3: 'Cloudflare-Tunnel läuft nicht',

    // interfaces.ts
    100: 'Metriken',
    101: 'Prometheus-Metrik-Endpunkt',

    // actions/cloudflareLogin.ts
    200: 'Bei Cloudflare anmelden',
    201: 'DNS-Zone hinzufügen',
    202: 'Authentifiziert mit einer Cloudflare-DNS-Zone. Führe diese Aktion erneut aus, um weitere Zonen hinzuzufügen.',
    209: 'Ein Name für Ihren neuen Cloudflare-Tunnel.',

    // actions/selectTunnel.ts
    210: 'Cloudflare-Tunnel: Nicht ausgewählt',
    211: 'Wähle, welchen Cloudflare-Tunnel dieser Server verwendet. Du kannst einen vorhandenen Tunnel auswählen oder einen neuen erstellen.',
    212: 'Melde dich zuerst bei Cloudflare an, um eine Zone zu konfigurieren',

    // actions/removeZone.ts
    220: 'DNS-Zone entfernen',
    221: 'Entfernt eine Cloudflare-DNS-Zone aus diesem Paket. Vorhandene Hostnamen in dieser Zone funktionieren möglicherweise weiterhin, aber dieses Paket verwaltet deren DNS- oder Tunnel-Routen nicht mehr.',
    222: 'Vorhandene DNS-Einträge und Ingress-Regeln in Cloudflare werden NICHT gelöscht.',
    223: 'Keine Zonen konfiguriert',

    // actions/addPublicHostname.ts
    230: 'Öffentlichen Hostnamen hinzufügen',
    231: 'Leitet einen öffentlichen Cloudflare-Hostnamen zu diesem Dienst weiter',
    232: 'Subdomain',
    233: 'Die Subdomain, die zu diesem Dienst weitergeleitet werden soll (z.B. meinapp).',
    234: 'Nur Subdomain, ohne Punkte (z.B. meinapp)',
    235: 'Domain',
    236: 'Melde dich bei Cloudflare an, um deine Domains zu sehen',
    237: 'Keine Zone konfiguriert',
    238: 'Melde dich zuerst bei Cloudflare an (führe die Aktion "Bei Cloudflare anmelden" aus), um eine DNS-Zone zu konfigurieren.',
    239: 'Kein Tunnel konfiguriert',
    240: 'Wähle zuerst einen Cloudflare-Tunnel (führe die Aktion "Cloudflare-Tunnel" aus).',
    241: 'Öffentlicher Hostname hinzugefügt',
    242: 'DNS-Eintrag automatisch erstellt.',
    243: 'Füge manuell einen CNAME-Eintrag im Cloudflare-Dashboard hinzu (mit Proxy).',

    // actions/importPublicHostnames.ts
    260: 'Öffentliche Hostnamen importieren',
    261: 'Scannt vorhandene öffentliche Hostnamen aus deinem Cloudflare-Tunnel und fügt URLs zu passenden installierten Diensten hinzu.',
    262: 'Dies scannt vorhandene öffentliche Hostnamen aus dem Cloudflare-Tunnel und fügt URLs zu passenden installierten Diensten hinzu.',
    263: 'Keine neuen öffentlichen Hostnamen in Cloudflare gefunden, die noch nicht erfasst sind.',
    264: 'Melde dich bei einer Cloudflare-DNS-Zone im selben Konto wie der ausgewählte Tunnel an und versuche es erneut.',

    // actions/deletePublicHostname.ts
    250: 'Öffentlichen Hostnamen löschen',
    251: 'Entfernt eine öffentliche Cloudflare-Hostname-Route',
    252: 'Dadurch wird dieser Hostname aus Ihrem Cloudflare-Tunnel und der DNS-Eintrag aus Cloudflare entfernt.',

    // actions/managedOverview.ts
    270: 'Verwaltete öffentliche Routen',
    271: 'Zeigt die DNS-Zonen, den Tunnel und die Anwendungsrouten von Cloudflare an, die aktuell von diesem Paket verwaltet werden.',
    272: 'Zeigt die DNS-Zonen, den Tunnel und die öffentlichen Hostnamen an, die aktuell von diesem Paket verwaltet werden.',
    273: 'Cloudflare-Tunnel',
    274: 'Kein Tunnel ausgewählt',
    275: 'Tunnelname',
    276: 'Tunnel-ID',
    277: 'Konto-ID',
    278: 'Konfigurierte DNS-Zonen',
    279: 'Keine DNS-Zonen konfiguriert',
    280: 'Domainname',
    281: 'Zonen-ID',
    282: 'Verwaltete Hostnamen',
    283: 'Verwaltete Anwendungsrouten',
    284: 'Derzeit werden keine öffentlichen Hostnamen verwaltet',
    285: 'Öffentliche URL',
    286: 'Paket',
    287: 'StartOS-Server',
    288: 'DNS-Zone',
    289: 'Schnittstellen-ID',
    290: 'Internes Ziel',
    291: 'Anwendungsrouten',
    292: 'In dieser Zone werden derzeit keine Anwendungsrouten verwaltet',
    300: 'Cloudflare-Routen reparieren',
    301: 'Verbindet verwaltete Cloudflare-Routen erneut mit den ausgewählten StartOS-Diensten.',
    302: 'Cloudflare-Routen repariert',
    303: 'Die verwalteten Cloudflare-Routen wurden erfolgreich aktualisiert.',
    304: 'Reparatur der Cloudflare-Routen fehlgeschlagen',
    305: 'Die Cloudflare-Routen konnten nicht sicher aktualisiert werden. Prüfe die Dienstprotokolle und versuche es erneut.',
    306: 'Bei Cloudflare anmelden, um eine DNS-Zone einzurichten',
    307: 'Einen Cloudflare-Tunnel für diesen Server auswählen oder erstellen',
    308: 'Die Cloudflare-Routen müssen erneut mit den ausgewählten StartOS-Diensten verbunden werden.',
    309: 'Für die Reparatur der Tunnelrouten sind keine Cloudflare-Zonenzugangsdaten verfügbar.',
  },
  pl_PL: {
    // main.ts
    1: 'Tunel Cloudflare',
    2: 'Tunel Cloudflare jest uruchomiony',
    3: 'Tunel Cloudflare nie jest uruchomiony',

    // interfaces.ts
    100: 'Metryki',
    101: 'Endpoint metryk Prometheus',

    // actions/cloudflareLogin.ts
    200: 'Zaloguj się do Cloudflare',
    201: 'Dodaj strefę DNS',
    202: 'Uwierzytelnia się ze strefą DNS Cloudflare. Uruchom tę akcję ponownie, aby dodać kolejne strefy.',
    209: 'Nazwa dla twojego nowego tunelu Cloudflare.',

    // actions/selectTunnel.ts
    210: 'Tunel Cloudflare: Nie wybrany',
    211: 'Wybierz, którego tunelu Cloudflare używa ten serwer. Możesz wybrać istniejący tunel lub utworzyć nowy.',
    212: 'Najpierw zaloguj się do Cloudflare, aby skonfigurować strefę',

    // actions/removeZone.ts
    220: 'Usuń strefę DNS',
    221: 'Usuwa strefę DNS Cloudflare z tego pakietu. Istniejące nazwy hostów w tej strefie mogą nadal działać, ale ten pakiet nie będzie już zarządzał ich trasami DNS ani tunelu.',
    222: 'Istniejące rekordy DNS i reguły przychodzące w Cloudflare NIE zostaną usunięte.',
    223: 'Brak skonfigurowanych stref',

    // actions/addPublicHostname.ts
    230: 'Dodaj publiczną nazwę hosta',
    231: 'Kieruje publiczną nazwę hosta Cloudflare do tej usługi',
    232: 'Subdomena',
    233: 'Subdomena do kierowania do tej usługi (np. mojapp).',
    234: 'Tylko subdomena, bez kropek (np. mojapp)',
    235: 'Domena',
    236: 'Zaloguj się do Cloudflare, aby zobaczyć swoje domeny',
    237: 'Brak skonfigurowanej strefy',
    238: 'Najpierw zaloguj się do Cloudflare (uruchom akcję "Zaloguj się do Cloudflare"), aby skonfigurować strefę DNS.',
    239: 'Brak skonfigurowanego tunelu',
    240: 'Najpierw wybierz tunel Cloudflare (uruchom akcję "Tunel Cloudflare").',
    241: 'Publiczna nazwa hosta dodana',
    242: 'Rekord DNS utworzony automatycznie.',
    243: 'Dodaj ręcznie rekord CNAME w panelu Cloudflare (z proxy).',

    // actions/importPublicHostnames.ts
    260: 'Importuj publiczne nazwy hostów',
    261: 'Skanuje istniejące publiczne nazwy hostów z tunelu Cloudflare i dodaje URL-e do pasujących zainstalowanych usług.',
    262: 'Spowoduje to skanowanie istniejących publicznych nazw hostów z tunelu Cloudflare i dodanie URL-i do pasujących zainstalowanych usług.',
    263: 'Nie znaleziono nowych publicznych nazw hostów w Cloudflare, które nie są jeszcze śledzone.',
    264: 'Zaloguj się do strefy DNS Cloudflare na tym samym koncie co wybrany tunel, a następnie spróbuj ponownie.',

    // actions/deletePublicHostname.ts
    250: 'Usuń publiczną nazwę hosta',
    251: 'Usuwa trasę publicznej nazwy hosta Cloudflare',
    252: 'Spowoduje to usunięcie tej nazwy hosta z tunelu Cloudflare i rekordu DNS z Cloudflare.',

    // actions/managedOverview.ts
    270: 'Zarządzane publiczne trasy',
    271: 'Pokazuje strefy DNS, tunel i trasy aplikacji Cloudflare, które są obecnie zarządzane przez ten pakiet.',
    272: 'Pokazuje strefy DNS, tunel i publiczne nazwy hostów, które są obecnie zarządzane przez ten pakiet.',
    273: 'Tunel Cloudflare',
    274: 'Nie wybrano tunelu',
    275: 'Nazwa tunelu',
    276: 'ID tunelu',
    277: 'ID konta',
    278: 'Skonfigurowane strefy DNS',
    279: 'Nie skonfigurowano stref DNS',
    280: 'Nazwa domeny',
    281: 'ID strefy',
    282: 'Zarządzane nazwy hostów',
    283: 'Zarządzane trasy aplikacji',
    284: 'Obecnie nie są zarządzane żadne publiczne nazwy hostów',
    285: 'Publiczny URL',
    286: 'Pakiet',
    287: 'Serwer StartOS',
    288: 'Strefa DNS',
    289: 'ID interfejsu',
    290: 'Cel wewnętrzny',
    291: 'Trasy aplikacji',
    292: 'W tej strefie nie są obecnie zarządzane żadne trasy aplikacji',
    300: 'Napraw trasy Cloudflare',
    301: 'Ponownie połącz zarządzane trasy Cloudflare z wybranymi usługami StartOS.',
    302: 'Trasy Cloudflare naprawione',
    303: 'Zarządzane trasy Cloudflare zostały pomyślnie zaktualizowane.',
    304: 'Naprawa tras Cloudflare nie powiodła się',
    305: 'Nie udało się bezpiecznie zaktualizować tras Cloudflare. Sprawdź dzienniki usługi i spróbuj ponownie.',
    306: 'Zaloguj się do Cloudflare, aby skonfigurować strefę DNS',
    307: 'Wybierz lub utwórz tunel Cloudflare dla tego serwera',
    308: 'Trasy Cloudflare muszą zostać ponownie połączone z wybranymi usługami StartOS.',
    309: 'Brak danych logowania strefy Cloudflare potrzebnych do naprawy tras tunelu.',
  },
  fr_FR: {
    // main.ts
    1: 'Tunnel Cloudflare',
    2: "Le tunnel Cloudflare est en cours d'exécution",
    3: "Le tunnel Cloudflare n'est pas en cours d'exécution",

    // interfaces.ts
    100: 'Métriques',
    101: 'Point de terminaison des métriques Prometheus',

    // actions/cloudflareLogin.ts
    200: 'Se connecter à Cloudflare',
    201: 'Ajouter une zone DNS',
    202: "S'authentifie avec une zone DNS Cloudflare. Relancez cette action pour ajouter des zones supplémentaires.",
    209: 'Un nom pour votre nouveau tunnel Cloudflare.',

    // actions/selectTunnel.ts
    210: 'Tunnel Cloudflare : Non sélectionné',
    211: 'Choisissez quel tunnel Cloudflare ce serveur utilise. Vous pouvez sélectionner un tunnel existant ou en créer un nouveau.',
    212: "Connectez-vous d'abord à Cloudflare pour configurer une zone",

    // actions/removeZone.ts
    220: 'Supprimer la zone DNS',
    221: "Supprime une zone DNS Cloudflare de ce paquet. Les noms d'hôte existants dans cette zone peuvent continuer à fonctionner, mais ce paquet ne gérera plus leurs routes DNS ni de tunnel.",
    222: "Les enregistrements DNS et les règles d'entrée existants dans Cloudflare ne seront PAS supprimés.",
    223: 'Aucune zone configurée',

    // actions/addPublicHostname.ts
    230: "Ajouter un nom d'hôte public",
    231: "Achemine un nom d'hôte public Cloudflare vers ce service",
    232: 'Sous-domaine',
    233: 'Le sous-domaine à acheminer vers ce service (ex. monapp).',
    234: 'Sous-domaine uniquement, sans points (ex. monapp)',
    235: 'Domaine',
    236: 'Connectez-vous à Cloudflare pour voir vos domaines',
    237: 'Aucune zone configurée',
    238: 'Connectez-vous d\'abord à Cloudflare (lancez l\'action "Se connecter à Cloudflare") pour configurer une zone DNS.',
    239: 'Aucun tunnel configuré',
    240: 'Sélectionnez d\'abord un tunnel Cloudflare (lancez l\'action "Tunnel Cloudflare").',
    241: "Nom d'hôte public ajouté",
    242: 'Enregistrement DNS créé automatiquement.',
    243: 'Ajoutez manuellement un enregistrement CNAME dans le tableau de bord Cloudflare (avec proxy).',

    // actions/importPublicHostnames.ts
    260: "Importer les noms d'h\u00f4tes publics",
    261: "Analyse les noms d'h\u00f4tes publics existants dans votre tunnel Cloudflare et ajoute des URLs aux services install\u00e9s correspondants.",
    262: "Cette action analysera les noms d'h\u00f4tes publics existants du tunnel Cloudflare et ajoutera des URLs aux services install\u00e9s correspondants.",
    263: "Aucun nouveau nom d'h\u00f4te public trouv\u00e9 dans Cloudflare qui ne soit pas d\u00e9j\u00e0 suivi.",
    264: 'Connectez-vous à une zone DNS Cloudflare du même compte que le tunnel sélectionné, puis réessayez.',

    // actions/deletePublicHostname.ts
    250: "Supprimer le nom d'h\u00f4te public",
    251: "Supprime une route de nom d'hôte public Cloudflare",
    252: "Cela supprimera ce nom d'hôte de votre tunnel Cloudflare et l'enregistrement DNS de Cloudflare.",

    // actions/managedOverview.ts
    270: 'Routes publiques gérées',
    271: 'Affiche les zones DNS, le tunnel et les routes applicatives Cloudflare actuellement gérés par ce paquet.',
    272: "Affiche les zones DNS, le tunnel et les noms d'hôte publics actuellement gérés par ce paquet.",
    273: 'Tunnel Cloudflare',
    274: 'Aucun tunnel sélectionné',
    275: 'Nom du tunnel',
    276: 'ID du tunnel',
    277: 'ID du compte',
    278: 'Zones DNS configurées',
    279: 'Aucune zone DNS configurée',
    280: 'Nom de domaine',
    281: 'ID de zone',
    282: "Noms d'hôte gérés",
    283: 'Routes applicatives gérées',
    284: "Aucun nom d'hôte public n'est actuellement géré",
    285: 'URL publique',
    286: 'Paquet',
    287: 'Serveur StartOS',
    288: 'Zone DNS',
    289: "ID de l'interface",
    290: 'Cible interne',
    291: 'Routes applicatives',
    292: "Aucune route applicative n'est actuellement gérée dans cette zone",
    300: 'Réparer les routes Cloudflare',
    301: 'Reconnecte les routes Cloudflare gérées aux services StartOS sélectionnés.',
    302: 'Routes Cloudflare réparées',
    303: 'Les routes Cloudflare gérées ont été mises à jour.',
    304: 'Échec de la réparation des routes Cloudflare',
    305: "Les routes Cloudflare n'ont pas pu être mises à jour en toute sécurité. Consultez les journaux du service, puis réessayez.",
    306: 'Connectez-vous à Cloudflare pour configurer une zone DNS',
    307: 'Sélectionnez ou créez un tunnel Cloudflare pour ce serveur',
    308: 'Les routes Cloudflare doivent être reconnectées aux services StartOS sélectionnés.',
    309: "Aucun identifiant de zone Cloudflare n'est disponible pour réparer les routes du tunnel.",
  },
} satisfies Record<string, LangDict>
