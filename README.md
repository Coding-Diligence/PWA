# PWA - Atelier pratique 1

## Contexte

L'objectif de cet atelier est de vous familiariser avec ce qui a pu être vu sur cette première journée de cours sur les PWA.  
Vous allez devoir créer une application web progressive qui permettra de créer des notes textuelles et de pouvoir y accéder même si vous n'avez pas de connexion internet.

Pour cet atelier, ne vous cassez pas la tête à faire de la synchronisation de données. On verra ça dès demain !  
Notre PWA se contentera de stocker les données en local _(localStorage)_ et de mettre en place un service worker pour le cache des ressources statiques.

## Étapes à réaliser

1. Initialiser les fichiers nécessaires pour votre application
2. Créer une interface utilisateur simple
   1. Création d'une note
      - Un champ de texte pour saisir le contenu de la note
      - Un bouton pour valider la création de la note
   2. Liste des notes
      - Afficher la liste des notes créées
      - Un champ de texte pour afficher le contenu de la note
      - Un bouton pour supprimer une note
      - Un bouton pour éditer une note
3. Gérer la persistance des données
   - À chaque ajout/modification/suppression d'une note, les données doivent être sauvegardées en local _(localStorage)_
   - À l'ouverture de l'application, les données doivent être chargées depuis le stockage local _(sauf si l'utilisateur est en ligne)_
4. Mettre en place un service worker pour le cache des ressources statiques
   - Les ressources statiques à mettre en cache sont les fichiers CSS et JS, ainsi que le fichier `index.html`
   - Le service worker doit être installé et activé
   - Les ressources mises en cache doivent être récupérées depuis le cache si l'utilisateur est hors ligne _(Cache First)_

## Charte graphique

Voici les contraintes à respecter :

- L'interface doit être responsive
- Les couleurs de l'interface doivent respecter la charte graphique suivante :
  - Couleur de fond : `#f0f0f0`
  - Couleur du texte : `white` | `black` _(selon les normes d'accessibilité WCAG et RGAA)_
  - Couleur des boutons : `#9cb6ed`
  - Couleur des boutons (hover) : `#4a4d89`
- La police d'écriture doit être `Arial` _(fallback : `sans serif`)_
- Les icônes de l'application _(fournies dans le dossier `assets/icons`)_ doivent être utilisées pour le `favicon` et les icônes de la PWA
- L'application se nomme `NoteKeeper`. Son titre complet est `NoteKeeper - Votre gestionnaire de notes`.

Pour le reste, vous êtes libre de réaliser l'interface utilisateur comme bon vous semble.  
Cependant attention à ne pas perdre inutilement du temps sur l'aspect graphique, l'objectif est de réaliser une PWA fonctionnelle !

## Informations utiles

- Pour lancer un serveur local, vous pouvez utiliser l'extension `Live Server` de Visual Studio Code
- Pour stocker les données en local, vous pouvez utiliser l'API `localStorage` de JavaScript
- Si l'utilisateur est hors ligne, préparez un message d'erreur pour l'informer qu'il ne peut pas altérer les notes
- Pour mettre en place un service worker, vous pouvez vous inspirer du code fourni dans le cours
- Pour tester votre PWA, vous pouvez utiliser l'outil de développement de votre navigateur pour simuler une connexion offline
  - Firefox : Onglet `Network` > Passer l'option `Aucune limitation de la bande passante` à `Offline`
  - Chrome : Onglet `Application` > Cocher l'option `Offline` dans la section `Service Workers`
- Vous pouvez être victime du cache de votre navigateur, pensez à vider le cache pour tester votre PWA si vous rencontrez des problèmes
- Pour stocker les notes en ligne, vous avez à votre disposition le fichier `api.js` qui contient toutes les méthodes qui vous seront nécessaires
- Essayez de passer par une étape à la fois, ne vous précipitez pas sur la totalité des fonctionnalités en même temps !
- Vous pouvez vérifier facilement si vous êtes en ligne ou non en utilisant `navigator.onLine`
  ```javascript
  if (navigator.onLine) {
    // L'utilisateur est en ligne
  } else {
    // L'utilisateur est hors ligne
  }
  ```

## Rendu de l'atelier

Ce projet est à rendre via [ce formulaire](https://forms.gle/puZatCw4dTVdDLUt5), en transmettant un lien vers le repository Github.
#   P W A  
 