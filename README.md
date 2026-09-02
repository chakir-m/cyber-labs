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
           ".write": true,
           "$category": {
             "$key": {
               ".validate": "newData.hasChildren(['value', 'ts'])"
             }
           }
         }
       },
       "course": {
         "unlocked-labs": {
           ".read": true,
           ".write": true
         }
       }
     }
   }
   ```

   > **⚠️ Si vous avez créé votre base Firebase avant l'ajout du verrouillage
   > des labs (section 3bis)**, vos règles actuelles ne contiennent
   > probablement que le bloc `"labs"` — le bloc `"course"` ci-dessus est
   > nécessaire pour que l'activation des labs par le formateur fonctionne.
   > Sans lui, Firebase refuse silencieusement la lecture/écriture sur ce
   > chemin (erreur `permission_denied` visible dans la console développeur),
   > et `labs.html` affiche un bandeau rouge d'avertissement pour vous le
   > signaler. Il suffit de coller les règles complètes ci-dessus (avec les
   > deux blocs `"labs"` et `"course"`) dans **Realtime Database > Règles**
   > puis de cliquer **Publier** — aucune autre action nécessaire, l'effet
   > est immédiat.

   > **Note sur la sécurité.** Ces règles sont volontairement ouvertes en
   > lecture/écriture pour rester simples à utiliser en salle de formation,
   > sans authentification à gérer par les participants. Les labs ne
   > demandent jamais d'information réellement identifiante (voir la
   > conception du Lab 1 : uniquement des types de comptes et des niveaux de
   > sensibilité, jamais d'identifiants réels). Si vous souhaitez restreindre
   > davantage l'accès plus tard (éviter qu'un inconnu sur Internet écrive
   > des données dans votre base), on peut ajouter un code de session ou une
   > authentification anonyme Firebase — demandez-le et on l'ajoutera.

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
5. Ajoutez une carte pour ce lab dans `index.html` à la racine du dépôt.
6. Publiez (upload sur GitHub) — aucune autre étape Firebase ou GitHub Pages
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
├── labs.html                           ← hub listant tous les labs, classés par module
├── assets/
│   ├── firebase-config.js              ← configuration Firebase (remplie une fois)
│   ├── lab-storage.js                  ← couche de stockage (remplace window.storage)
│   ├── course-lock.js                  ← verrouillage/déverrouillage des labs par le formateur
│   ├── formateur-auth.js               ← protection par mot de passe du mode formateur
│   ├── lab-engine.css                  ← styles partagés par tous les labs
│   ├── lab-engine.js                   ← moteur partagé (landing, dashboard, QR, CSV, détail, jauge SVG...)
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
