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
       }
     }
   }
   ```

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

## 4. Ajouter un prochain lab (même modèle)

Pour chaque nouveau lab du programme :

1. Dupliquer un dossier de lab existant (ex. `module1-traqueur-exposition/`)
   et le renommer (ex. `module5-coffre-fort-mdp/`).
2. Dans son `index.html`, changer uniquement cette ligne :
   ```html
   <script>window.LAB_ID = "module5-coffre-fort-mdp";</script>
   ```
   (un identifiant unique par lab — c'est ce qui sépare les données de
   chaque exercice dans la même base Firebase).
3. Adapter le contenu du jeu (questions, cartes, textes) selon le lab.
4. Ajouter une carte pour ce lab dans `index.html` à la racine du dépôt.
5. Publier (`git push`) — GitHub Pages se met à jour automatiquement en
   1 à 2 minutes, aucune autre étape Firebase n'est nécessaire.

---

## Structure du dépôt

```
/
├── index.html                          ← page d'accueil listant tous les labs
├── assets/
│   ├── firebase-config.js              ← configuration Firebase (remplie une fois)
│   └── lab-storage.js                  ← couche de stockage partagée par tous les labs
└── module1-traqueur-exposition/
    └── index.html                      ← le lab lui-même
```
