# Labs interactifs — Les Fondamentaux de la Cybersécurité

Dépôt contenant les labs ludiques du programme, hébergés gratuitement sur
GitHub Pages, avec un tableau de bord formateur en temps réel.

Ce dépôt est conçu pour accueillir **tous les futurs labs** du programme
sans reconfiguration : la mise en place ci-dessous n'est à faire **qu'une
seule fois**.

---

## 1. Créer le projet Firebase (une seule fois, ~5 minutes)

Firebase joue le rôle de petit serveur gratuit pour faire remonter les
réponses des participants vers le tableau de bord du formateur en direct —
GitHub Pages ne sert que des fichiers statiques et ne peut pas faire ça seul.

1. Aller sur [console.firebase.google.com](https://console.firebase.google.com)
   et se connecter avec un compte Google (personnel ou professionnel).
2. Cliquer sur **Ajouter un projet**, lui donner un nom (ex. `cyber-labs`),
   désactiver Google Analytics si proposé (non nécessaire), créer le projet.
   Le plan gratuit **Spark** suffit largement — aucune carte bancaire requise.
3. Dans le menu de gauche : **Build > Realtime Database** > **Créer une base
   de données**.
   - Choisir une région proche (ex. `europe-west1`).
   - Démarrer en **mode test** (on remplacera les règles par défaut à
     l'étape 5 ci-dessous).
3bis. Dans le menu de gauche : **Build > Authentication** > **Get started** >
   onglet **Sign-in method** > activer le fournisseur **E-mail/Mot de
   passe** (première option de la liste) > **Enregistrer**. C'est ce qui
   permet aux candidats de créer un vrai compte (e-mail + mot de passe) sur
   `commencer.html` — sans cette étape, l'inscription et la connexion
   échoueront avec une erreur `auth/operation-not-allowed`.
4. Cliquer sur l'icône ⚙️ (Paramètres du projet) en haut du menu de gauche >
   **Paramètres du projet** > onglet **Général** > section **Vos
   applications** > cliquer sur l'icône **`</>`** (Web).
   - Donner un nom (ex. `cyber-labs-web`).
   - **Ne pas cocher** "Configurer aussi Firebase Hosting" (on utilise
     GitHub Pages à la place).
   - Cliquer sur **Enregistrer l'application**.
   - Copier l'objet `firebaseConfig` affiché (il ressemble à l'exemple
     ci-dessous) — vous en aurez besoin à l'étape suivante.

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "cyber-labs-xxxxx.firebaseapp.com",
     databaseURL: "https://cyber-labs-xxxxx-default-rtdb.europe-west1.firebasedatabase.app",
     projectId: "cyber-labs-xxxxx",
     storageBucket: "cyber-labs-xxxxx.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

5. Coller cet objet dans le fichier [`assets/firebase-config.js`](./assets/firebase-config.js)
   de ce dépôt, à la place de l'exemple qui s'y trouve.

6. Retourner dans **Realtime Database > Règles**, remplacer le contenu par
   les règles ci-dessous, puis **Publier**.

   ```json
   {
     "rules": {
       "labs": {
         "$labId": {
           ".read": true,
           "shared": {
             ".write": "auth != null",
             "$key": {
               ".validate": "newData.hasChildren(['value', 'ts'])"
             }
           },
           "private": {
             "$deviceOrUid": {
               ".write": "auth != null"
             }
           }
         }
       },
       "course": {
         "unlocked-labs": {
           ".read": true,
           ".write": true
         }
       },
       "retakes": {
         ".read": true,
         ".write": true
       },
       "participants": {
         ".read": true,
         "$uid": {
           ".write": "auth != null && auth.uid === $uid"
         }
       }
     }
   }
   ```

   > **⚠️ Mise à jour des règles (ajout des comptes candidats).** Ces règles
   > remplacent celles des versions précédentes de ce dépôt : l'écriture des
   > résultats de labs et de la fiche d'inscription nécessite désormais un
   > compte candidat connecté (`auth != null`) — un visiteur non connecté ne
   > peut plus rien écrire, seulement lire les tableaux de bord publics
   > (`certificat.html` reste utilisable sans exposer les données de qui que
   > ce soit d'autre). Chacun ne peut écrire que sa **propre** fiche
   > `participants/{uid}` (`auth.uid === $uid`), pas celle d'un autre
   > candidat. Si vous avez une base créée avant cette mise à jour, recollez
   > l'intégralité du bloc ci-dessus dans **Realtime Database > Règles** puis
   > **Publier** — sans oublier l'étape 3bis ci-dessus (activer le
   > fournisseur e-mail/mot de passe dans **Authentication**), sans quoi
   > `auth != null` ne sera jamais vrai et toute écriture échouera.

   > **Note sur la sécurité.** Le verrouillage des labs (`course/...`) et les
   > autorisations de reprise (`retakes/...`) restent volontairement ouverts
   > en écriture : il n'existe pas de vrai compte "formateur" côté Firebase
   > (juste un mot de passe partagé côté `assets/formateur-auth.js`), donc
   > cette porte ne peut pas être restreinte par les règles elles-mêmes —
   > voir la mise en garde dans ce fichier. Comme précédemment, les labs ne
   > demandent jamais d'information réellement identifiante en dehors du nom
   > et de l'e-mail du compte (voir la conception du Lab 1 : uniquement des
   > types de comptes et des niveaux de sensibilité).

Cette configuration Firebase est **partagée par tous les labs** du programme :
vous ne la referez plus jamais, même en ajoutant de nouveaux exercices.

---

## 2. Publier ce dépôt sur GitHub Pages (une seule fois, ~3 minutes)

1. Créer un nouveau dépôt GitHub (public ou privé — GitHub Pages fonctionne
   avec les deux sur les comptes gratuits, mais un dépôt privé nécessite
   GitHub Pro/Team pour publier un site accessible publiquement... privilégiez
   un dépôt **public** si vous voulez que ce soit gratuit et accessible).
2. Ajouter tous les fichiers de ce dossier au dépôt (glisser-déposer sur
   GitHub, ou via `git push` si vous êtes à l'aise en ligne de commande).
3. Dans le dépôt GitHub : **Settings > Pages**.
   - **Source** : `Deploy from a branch`.
   - **Branch** : `main`, dossier `/ (root)`.
   - **Save**.
4. Attendre 1 à 2 minutes. L'URL de votre site apparaît en haut de cette
   même page, sous la forme :

   ```
   https://votre-nom-utilisateur.github.io/nom-du-depot/
   ```

5. Ouvrir cette URL : vous devez voir la page d'accueil listant les labs
   disponibles.

---

## 3. Utiliser un lab en formation

1. Ouvrir `https://.../nom-du-depot/module1-traqueur-exposition/` sur
   l'ordinateur du formateur.
2. Cliquer sur **Je suis formateur** : un QR code apparaît, généré
   automatiquement à partir de l'URL réelle de la page (fonctionne
   immédiatement, aucune configuration supplémentaire).
3. Projeter ce QR code. Chaque participant le scanne avec son téléphone,
   arrive sur la même page, et choisit **Je suis participant**.
4. Le tableau de bord du formateur se met à jour automatiquement toutes les
   4 secondes au fur et à mesure que les participants terminent.

---

## 3bis. Activer les labs au fur et à mesure (`labs.html`)

Par défaut, **tous les labs sont verrouillés** pour les participants — ils
apparaissent dans `labs.html` grisés avec la mention « 🔒 Pas encore
activé », visibles mais non cliquables. C'est volontaire : cela évite qu'un
participant curieux avance sur un module que vous n'avez pas encore
présenté.

1. Ouvrir `https://.../nom-du-depot/labs.html`.
2. Cliquer sur **🔑 Mode formateur** et saisir le mot de passe (le même que
   pour les tableaux de bord — voir `assets/formateur-auth.js`).
3. Cliquer sur un module pour le déplier, puis basculer l'interrupteur du
   lab que vous venez de terminer en cours. Les boutons **Tout activer** /
   **Tout verrouiller** permettent de traiter un module entier en un clic.
4. Les participants qui ont déjà `labs.html` ouvert sur leur téléphone
   voient le changement apparaître automatiquement, sans recharger la page.

Le verrouillage est une double sécurité : même si un participant a
bookmarké ou reçu directement le lien d'un lab précis, la page du lab
elle-même refuse de démarrer la partie tant qu'il n'a pas été activé
(le bouton **Je suis participant** reste grisé). L'accès **formateur**
reste lui toujours possible sur un lab verrouillé, pour préparer ou tester
en amont.

La page `labs.html` fonctionne aussi en accordéon : les 10 modules sont
repliés par défaut (seul l'en-tête est visible) et se déplient
individuellement au clic, pour ne faire défiler que ce qui vous intéresse.

---

## 3bis-bis. Comptes candidats (`commencer.html`)

Page publique à partager en tout premier (avant même le premier module),
par exemple via un QR code projeté en salle. Le participant y crée un vrai
compte : nom, e-mail, mot de passe (Firebase Authentication) — ou se
connecte s'il en a déjà un.

- Le compte est stocké dans Firebase Authentication (e-mail + mot de passe
  hashé côté serveur, jamais en clair) et une fiche `participants/{uid}`
  (nom, e-mail, date de création) est créée pour que le formateur voie qui
  s'est inscrit, même avant tout lab commencé.
- Une fois connecté, l'accès est valable sur **tous les labs et pages**
  (`labs.html`, `mon-parcours.html`, chaque module) et **sur n'importe quel
  appareil** — contrairement à l'ancienne mémorisation par
  `localStorage`, un participant qui change de téléphone retrouve sa
  progression en se reconnectant simplement avec son e-mail.
- **Aucun lab n'est accessible sans être connecté** : ouvrir directement
  l'URL d'un lab redirige automatiquement vers `commencer.html`, puis
  ramène le participant exactement là où il voulait aller une fois connecté.
- Mot de passe oublié : un lien d'inscription envoie un e-mail de
  réinitialisation via Firebase (aucune configuration supplémentaire
  nécessaire, tant que le fournisseur e-mail/mot de passe est activé —
  voir section 1, étape 3bis).

> ⚠️ **Limite à connaître** (documentée aussi dans `assets/formateur-auth.js`
> pour le mode formateur) : ce dépôt reste 100% statique (GitHub Pages), donc
> la protection des labs est appliquée **côté client** (JavaScript), pas par
> un vrai serveur — combinée aux règles Firebase de la section 1 (écriture
> refusée sans compte), c'est une barrière sérieuse pour un usage en
> formation, mais pas un niveau de sécurité "production" pour des données
> sensibles.

---

## 3ter. Espace candidat (`mon-parcours.html`)

Nouvelle page centrale pour chaque participant, accessible dès qu'il est
connecté (lien **📈 Mon parcours** en haut de `labs.html`, ou redirection
automatique après connexion) :

- **Barre de progression globale** (ex. 5/21) et pourcentage.
- **Prochain lab à faire**, mis en avant avec un bouton direct — le premier
  lab non terminé et déjà déverrouillé par le formateur, dans l'ordre du
  programme.
- **Détail par module** : chaque lab affiché comme Terminé ✓, Disponible
  (bouton Commencer), ou 🔒 Pas encore activé.
- **Certificat** : bouton actif uniquement une fois les 21 labs terminés,
  vers `certificat.html` (qui détecte désormais automatiquement le compte
  connecté — plus besoin de retaper son pseudo).

---

## 3quater. Espace formateur avancé (`admin.html`)

Accessible depuis `labs.html` via le bouton **📊 Espace formateur avancé**
(même mot de passe), cette page centralise tout ce qui ne concerne pas
directement le verrouillage des labs :

- **Vue d'ensemble** : nombre de comptes créés, nombre total de réponses,
  nombre de participants **en cours** (1 à 20 labs), nombre ayant **terminé**
  l'intégralité du parcours, et **progression moyenne** (%) parmi ceux ayant
  commencé — une moyenne de la progression individuelle de chacun, pas un
  taux binaire "a tout fini ou pas" (qui affichait 0% tant que personne
  n'avait terminé les 21 labs, même si plusieurs participants en avaient
  déjà fait la moitié).
- **Matrice participant × lab** : un tableau récapitulatif (qui a fait quoi,
  avec le score obtenu), filtrable par pseudo et exportable en CSV — utile
  pour un suivi après-formation sans devoir ouvrir les 21 tableaux de bord
  un par un.
- **Recherche de certificat** : vérifiez la progression de n'importe quel
  participant sans qu'il ait besoin de le faire lui-même.
- **Nouvelle session** : voir section suivante.

> ℹ️ **Regroupement par compte, pas par texte.** Depuis l'ajout des comptes
> candidats, chaque participant est identifié par son compte (uid Firebase),
> pas par une correspondance de texte sur le pseudo — un participant qui se
> reconnecte sur un autre appareil, ou dont le nom contient des variations
> de casse/espaces, reste bien reconnu comme la même personne. D'anciennes
> réponses enregistrées avant cette mise à jour (sans compte associé) sont
> encore agrégées par pseudo exact, par rétrocompatibilité.

### Nouvelle session (remplace l'ancien bouton « Réinitialiser »)

Le bouton **🆕 Démarrer une nouvelle session**, dans la zone rouge en bas de
`admin.html`, efface **définitivement** les réponses de tous les
participants sur les 21 labs, la fiche de progression de chaque compte, et
reverrouille l'ensemble du parcours — à utiliser uniquement entre deux
sessions de formation (par exemple avant d'accueillir un nouveau groupe),
jamais en cours de route. Une double confirmation est demandée avant toute
suppression.

> ⚠️ **Limite à connaître.** Ce bouton n'efface que les données de
> progression dans Realtime Database — il ne supprime **pas** les comptes
> Firebase Authentication (e-mail + mot de passe) eux-mêmes : les
> participants d'une session précédente pourront toujours se reconnecter
> avec leurs identifiants (progression repartie à zéro). Pour supprimer
> réellement les comptes entre deux groupes, allez dans la console Firebase
> **Authentication > Users**, sélectionnez les comptes à retirer, puis
> **Delete account**. Ce n'est pas automatisable depuis une page 100%
> statique sans clé d'administration côté serveur.

---

## 3quinquies. Certificat de réussite (`certificat.html`)

Page réservée aux candidats connectés — la progression et le certificat
sont calculés **automatiquement à partir du compte** (plus besoin de
ressaisir un pseudo) :

- **Tant que les 21 labs ne sont pas tous complétés**, la page affiche
  uniquement une barre de progression et la liste des labs manquants —
  **aucun certificat ni résultat global n'est jamais affiché avant la fin
  complète du parcours**, par conception.
- **Une fois les 21 labs terminés**, un certificat nominatif s'affiche
  (nom du participant, date de complétion), imprimable ou exportable en PDF
  via le bouton dédié (utilise l'impression du navigateur).

L'identification se fait par le compte connecté (uid) ; pour d'anciennes
réponses enregistrées avant les comptes, une correspondance de secours par
pseudo exact reste appliquée.

---

## 3sexies. Reprise après rafraîchissement de page

Un rafraîchissement (F5, ou rechargement du navigateur) ne renvoie plus
systématiquement à l'écran d'accueil :

- **Un lab déjà terminé par le compte connecté** réaffiche directement le
  résultat obtenu, sur n'importe quel appareil (la vérification se fait
  dans Firebase, pas seulement localement) — cela évite aussi qu'un
  participant soumette deux fois le même lab par erreur.
- **Le tableau de bord formateur** (`view-dash`, dans un lab ou sur
  `admin.html`) reste affiché après un F5 tant que l'accès formateur est
  encore valide dans l'onglet, au lieu de repasser par l'écran d'accueil.
- **`labs.html`** retient le mode formateur et les modules dépliés d'un
  rafraîchissement à l'autre (mémorisation par onglet).

> ⚠️ **Limite assumée.** Un lab **en cours** (commencé mais pas encore
> soumis) ne peut pas reprendre exactement à la carte/question où le
> participant s'est arrêté après un F5 : chaque lab gère son propre état de
> jeu en interne (dans son `lab-content.js` propre), indépendamment du
> moteur partagé, et cet état n'est pas persistant par conception (pas de
> sauvegarde intermédiaire). Dans ce cas précis, le participant repart de
> l'écran d'accueil et relance le lab depuis le début. Si ce cas devient
> gênant en pratique (labs longs, réseau instable en salle), on peut ajouter
> une sauvegarde de progression intermédiaire lab par lab — à la demande.

---

## 3septies. Blocage de repassage + autorisation de reprise formateur

Un candidat qui a déjà terminé un lab **ne peut plus le repasser seul** : en
rouvrant la page (ou en y revenant depuis `mon-parcours.html`), il retombe
directement sur son résultat, accompagné d'un message :

- **Sans autorisation** : « 🔒 Vous avez déjà terminé ce lab... demandez à
  votre formateur de vous autoriser une reprise. » — aucun moyen de
  recommencer par lui-même.
- **Avec autorisation accordée** : le nombre de reprises restantes est
  affiché, avec un bouton « Repasser le lab → ».

Le formateur accorde ces autorisations depuis `admin.html`, section
**Autoriser une reprise de lab** : choisir un participant (uniquement ceux
ayant un compte, l'autorisation étant liée à un uid) et un lab, puis
**Autoriser 1 reprise**, **Autoriser sans limite**, ou **Retirer
l'autorisation**. Une reprise à usage unique est automatiquement
"consommée" (décrémentée) dès que le candidat soumet son nouveau résultat —
pas au moment où il clique sur "Repasser", pour ne pas pénaliser un
abandon en cours de route.

> ℹ️ Techniquement, ceci est stocké dans `retakes/{labId}/{uid}` (voir les
> règles Firebase, section 1) et remplacé/écrasé par `admin.html` sans
> historique des autorisations précédentes — seule l'autorisation active
> compte.

---

## 4. Ajouter un prochain lab (architecture à moteur partagé)

Depuis la refonte, chaque lab ne contient plus que **deux fichiers propres à
lui** : un `index.html` quasi identique pour tous les labs, et un
`lab-content.js` qui décrit son contenu (le jeu, les questions, les scores).
Tout le reste — landing, pseudo, mot de passe formateur, tableau de bord,
QR code, export CSV, réinitialisation, vue détail — est fourni une fois pour
toutes par `assets/lab-engine.js` et `assets/lab-engine.css`.

Pour créer un nouveau lab :

1. Créez un nouveau dossier (ex. `module5-coffre-fort-mdp/`).
2. Copiez-y `assets/lab-template.html`, renommez-le `index.html`.
3. Dans ce fichier, changez uniquement :
   ```html
   <script>window.LAB_ID = "module5-coffre-fort-mdp";</script>
   ```
   et le `<title>` en haut du fichier.
4. Copiez `assets/lab-content.template.js` dans le même dossier sous le nom
   `lab-content.js`, et adaptez-le à votre lab en suivant les commentaires
   (le gabarit explique chacune des 6 sections à remplir : le jeu, le résumé
   participant, le badge de score, les statistiques collectives, le détail
   individuel, et les colonnes de l'export CSV).
5. Ajoutez une entrée pour ce lab dans `assets/modules-data.js` (dans le
   tableau `labs` du module concerné) — cette liste est partagée par
   `labs.html`, `admin.html` et `certificat.html`, un seul endroit à modifier.
6. Pensez aussi à ajouter la pastille du lab dans la carte du module
   correspondant sur `index.html` (la page d'accueil marketing) — cette page
   a sa propre liste HTML, volontairement séparée pour ne pas mélanger
   contenu marketing et logique applicative.
7. Publiez (upload sur GitHub) — aucune autre étape Firebase ou GitHub Pages
   n'est nécessaire.

Le fichier `module1-traqueur-exposition/lab-content.js` déjà livré sert
lui-même d'exemple complet et fonctionnel à consulter.

---

## Composants visuels partagés

Plusieurs labs utilisent des composants graphiques fournis par `assets/lab-engine.js`, pour rester cohérents visuellement sans dupliquer de code :

- **Jauge de risque** (`LabEngine.gaugeMarkup` / `bindGauge`) — cadran semi-circulaire à aiguille animée, utilisé par les labs à 3 paliers (Feu du Téléchargement, Feu du Télétravail, Feu du Partage Cloud, Niveau de Gravité, Feu des Objets Connectés, Grille de Risque).
- Les autres labs (grilles de cartes illustrées, mockup de smartphone, diagramme circulaire, quadrant, e-mail/visio interactifs) sont construits directement dans leur propre `lab-content.js`, le mécanisme étant trop spécifique à chacun pour être partagé.

## Structure du dépôt

```
/
├── index.html                          ← page d'accueil PAR DÉFAUT (présentation de la formation 2 jours)
├── programme.html                      ← plaquette détaillée du programme (planning J1/J2, tableau des labs)
├── commencer.html                      ← création de compte / connexion candidat (Firebase Authentication, à partager en premier)
├── mon-parcours.html                   ← espace candidat : progression, prochain lab, accès certificat à 100%
├── labs.html                           ← hub listant tous les labs, classés par module (verrouillage inclus)
├── admin.html                          ← espace formateur avancé (vue d'ensemble, export CSV, nouvelle session)
├── certificat.html                     ← certificat de réussite, calculé automatiquement pour le compte connecté
├── assets/
│   ├── firebase-config.js              ← configuration Firebase (remplie une fois)
│   ├── candidate-auth.js               ← authentification candidat (inscription/connexion/mot de passe oublié) — Firebase Authentication
│   ├── lab-storage.js                  ← couche de stockage (remplace window.storage) + file d'attente locale hors-ligne
│   ├── course-lock.js                  ← verrouillage/déverrouillage des labs par le formateur
│   ├── modules-data.js                 ← liste centrale des 10 modules/21 labs (utilisée par labs.html, admin.html, certificat.html, mon-parcours.html)
│   ├── formateur-auth.js               ← protection par mot de passe du mode formateur
│   ├── lab-engine.css                  ← styles partagés par tous les labs
│   ├── lab-engine.js                   ← moteur partagé (landing, dashboard, QR, CSV, détail, jauge SVG, garde d'authentification, reprise après F5...)
│   ├── lab-template.html               ← gabarit HTML à dupliquer pour un nouveau lab
│   └── lab-content.template.js         ← gabarit commenté du contenu d'un lab
├── module1-traqueur-exposition/
│   ├── index.html                      ← copie du gabarit, juste LAB_ID + titre changés
│   └── lab-content.js                  ← le contenu propre à CE lab (le jeu, les scores...)
├── module1-radar-menaces/
│   └── ...                             ← Lab 2 du Module 1 (quiz origine/intention)
├── module1-cartographie-impact/
│   └── ...                             ← Lab 3 du Module 1 (sélection + classification + duel)
├── module2-radar-cia/
│   └── ...                             ← Lab 1 du Module 2 (quiz de classification C/I/A, multi-sélection)
├── module2-grille-risque/
│   └── ...                             ← Lab 2 du Module 2 (estimation M×V×I + classement par priorité)
├── module3-detective-malwares/
│   └── ...                             ← Lab 1 du Module 3 (choix unique parmi 8 familles de malwares)
├── module3-feu-telechargement/
│   └── ...                             ← Lab 2 du Module 3 (évaluation de risque à 3 niveaux, 4 situations)
├── module4-anatomie-phishing/
│   └── ...                             ← Lab 1 du Module 4 (checklist multi-sélection, signaux vs distracteurs)
├── module4-technique-ingenierie/
│   └── ...                             ← Lab 2 du Module 4 (choix unique parmi 5 techniques d'ingénierie sociale)
├── module5-coffre-mots-passe/
│   └── ...                             ← Lab 1 du Module 5 (robustesse de mots de passe, échelle à 4 niveaux)
├── module5-signal-compromission/
│   └── ...                             ← Lab 2 du Module 5 (classification binaire : signal réel ou fausse alerte)
├── module6-faux-point-acces/
│   └── ...                             ← Lab 1 du Module 6 (choix unique, options variables par lieu)
├── module6-feu-teletravail/
│   └── ...                             ← Lab 2 du Module 6 (évaluation de risque à 3 niveaux, 4 situations)
├── module7-verificateur-321/
│   └── ...                             ← Lab 1 du Module 7 (checklist multi-sélection, 3 dispositifs × 3 critères)
├── module7-feu-partage-cloud/
│   └── ...                             ← Lab 2 du Module 7 (évaluation de risque à 3 niveaux, 4 situations)
├── module8-cycle-incident/
│   └── ...                             ← Lab 1 du Module 8 (association de 6 actions aux 5 étapes du cycle d'incident)
├── module8-gravite-incident/
│   └── ...                             ← Lab 2 du Module 8 (classification Mineur/Majeur/Critique, 5 situations)
├── module9-qui-fait-quoi/
│   └── ...                             ← Lab 1 du Module 9 (choix unique parmi 8 textes/autorités/normes)
├── module9-metiers-cyber/
│   └── ...                             ← Lab 2 du Module 9 (choix unique parmi 4 métiers de la cybersécurité)
├── module10-detecteur-deepfake/
│   └── ...                             ← Lab 1 du Module 10 (checklist multi-sélection, signaux vs distracteurs)
└── module10-feu-objets-connectes/
    └── ...                             ← Lab 2 du Module 10 (évaluation de risque à 3 niveaux, 4 situations)
```
