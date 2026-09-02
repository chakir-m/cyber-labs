// assets/modules-data.js
//
// Liste centrale des 10 modules et de leurs labs — utilisée par labs.html,
// admin.html et certificat.html. Un seul endroit à mettre à jour quand un
// nouveau lab est ajouté (voir section 4 du README).

const MODULES_DATA = [
  {
    num: 1, title: "Introduction à la cybersécurité",
    labs: [
      { id: "module1-traqueur-exposition", icon: "🔍", title: "Traqueur d'Exposition", sub: "Identifier ses informations sensibles", href: "./module1-traqueur-exposition/" },
      { id: "module1-radar-menaces", icon: "🎯", title: "Radar des Menaces", sub: "Reconnaître les grandes catégories de cybermenaces", href: "./module1-radar-menaces/" },
      { id: "module1-cartographie-impact", icon: "🗺️", title: "Cartographie d'Impact", sub: "Évaluer l'impact potentiel d'un incident", href: "./module1-cartographie-impact/" },
    ],
  },
  {
    num: 2, title: "Notions fondamentales",
    labs: [
      { id: "module2-radar-cia", icon: "🧭", title: "Radar CIA", sub: "Classer des incidents selon la triade Confidentialité/Intégrité/Disponibilité", href: "./module2-radar-cia/" },
      { id: "module2-grille-risque", icon: "⚖️", title: "Grille de Risque", sub: "Estimer Menace × Vulnérabilité × Impact et prioriser 3 scénarios", href: "./module2-grille-risque/" },
    ],
  },
  {
    num: 3, title: "Panorama des malwares",
    labs: [
      { id: "module3-detective-malwares", icon: "🕵️", title: "Détective des Malwares", sub: "Identifier la bonne famille de malware parmi 8 (virus, ver, botnet, rootkit...)", href: "./module3-detective-malwares/" },
      { id: "module3-feu-telechargement", icon: "🚦", title: "Feu Rouge du Téléchargement", sub: "Évaluer le niveau de risque de 4 demandes de téléchargement", href: "./module3-feu-telechargement/" },
    ],
  },
  {
    num: 4, title: "Attaques Web, emails & ingénierie sociale",
    labs: [
      { id: "module4-anatomie-phishing", icon: "🎣", title: "Anatomie du Phishing", sub: "Repérer les vrais signaux d'alerte d'un e-mail suspect (et éviter les faux)", href: "./module4-anatomie-phishing/" },
      { id: "module4-technique-ingenierie", icon: "🎭", title: "Techniques d'Ingénierie Sociale", sub: "Reconnaître vishing, baiting, pretexting, smishing et quishing", href: "./module4-technique-ingenierie/" },
    ],
  },
  {
    num: 5, title: "Identités & accès",
    labs: [
      { id: "module5-coffre-mots-passe", icon: "🔐", title: "Coffre-Fort des Mots de Passe", sub: "Évaluer la robustesse de 4 mots de passe sur une échelle à 4 niveaux", href: "./module5-coffre-mots-passe/" },
      { id: "module5-signal-compromission", icon: "📡", title: "Signal ou Bruit", sub: "Détecter un vrai signe de compromission de compte, sans fausse alerte", href: "./module5-signal-compromission/" },
    ],
  },
  {
    num: 6, title: "Sécurité mobile, Wi-Fi & télétravail",
    labs: [
      { id: "module6-faux-point-acces", icon: "📶", title: "Faux Point d'Accès", sub: "Trouver le bon réflexe face à des réseaux Wi-Fi publics dans 4 lieux", href: "./module6-faux-point-acces/" },
      { id: "module6-feu-teletravail", icon: "🏠", title: "Feu du Télétravail", sub: "Évaluer le niveau de risque de 4 situations à domicile", href: "./module6-feu-teletravail/" },
    ],
  },
  {
    num: 7, title: "Sauvegardes, Cloud & données personnelles",
    labs: [
      { id: "module7-verificateur-321", icon: "💾", title: "Vérificateur 3-2-1", sub: "Confronter 3 dispositifs de sauvegarde aux critères de la règle 3-2-1", href: "./module7-verificateur-321/" },
      { id: "module7-feu-partage-cloud", icon: "☁️", title: "Feu du Partage Cloud", sub: "Évaluer le niveau de risque de 4 configurations de partage cloud", href: "./module7-feu-partage-cloud/" },
    ],
  },
  {
    num: 8, title: "Cybersécurité en entreprise & gestion des incidents",
    labs: [
      { id: "module8-cycle-incident", icon: "🔄", title: "Cycle de l'Incident", sub: "Associer 6 actions aux 5 étapes du cycle de gestion d'incident", href: "./module8-cycle-incident/" },
      { id: "module8-gravite-incident", icon: "🚨", title: "Niveau de Gravité", sub: "Classer 5 incidents en Mineur, Majeur ou Critique", href: "./module8-gravite-incident/" },
    ],
  },
  {
    num: 9, title: "Cadres normatifs & métiers de la cybersécurité",
    labs: [
      { id: "module9-qui-fait-quoi", icon: "⚖️", title: "Qui Fait Quoi", sub: "Associer 6 descriptions au bon texte, à la bonne autorité ou à la bonne norme", href: "./module9-qui-fait-quoi/" },
      { id: "module9-metiers-cyber", icon: "🧑‍💻", title: "Métiers de la Cybersécurité", sub: "Associer 4 descriptions de mission au bon métier", href: "./module9-metiers-cyber/" },
    ],
  },
  {
    num: 10, title: "Tendances actuelles & plan d'action personnel",
    labs: [
      { id: "module10-detecteur-deepfake", icon: "🎭", title: "Détecteur de Deepfake", sub: "Repérer les vrais signaux d'alerte d'un appel vidéo suspect (et éviter les faux)", href: "./module10-detecteur-deepfake/" },
      { id: "module10-feu-objets-connectes", icon: "📡", title: "Feu des Objets Connectés", sub: "Évaluer le niveau de risque de 4 objets connectés", href: "./module10-feu-objets-connectes/" },
    ],
  },
];
