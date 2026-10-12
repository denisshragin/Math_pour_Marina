# Comment utiliser ce site de mathématiques

## Ajouter un nouveau groupe de problèmes

1. Crée un nouveau fichier `.md` dans le dossier `exercises/`. Par exemple : `exercises/division.md`

2. Respecte ce format exactement :

```markdown
# Division

1. 12 ÷ 3 = ?

2. 20 ÷ 4 = ?

3. 18 ÷ 6 = ?

Answer: 4, 5, 3
```

**Important sur l'alignement des réponses :**
- La ligne `Answer:` doit contenir les bonnes réponses séparées par des virgules
- L'ordre des réponses correspond à l'ordre des questions. Question 1 → première réponse, Question 2 → deuxième réponse, etc.
- Si ta réponse contient un nombre décimal ou une fraction (même si rare), ça fonctionne aussi. Le code compare les valeurs numériques.

## Ajouter le groupe à la page d'accueil

Ouvre `js/app.js` et modifie la fonction `loadExerciseList()` :

```javascript
const exercises = [
    { file: 'problems-fr.md', title: 'Problèmes Mathématiques' },
    { file: 'calcul-mental.md', title: 'Calcul Mental' },
    { file: 'fractions.md', title: 'Fractions et Nombres' },
    { file: 'multiplication.md', title: 'Multiplication' },
    { file: 'division.md', title: 'Division' }  // Ajoute cette ligne
];
```

Remplace juste `division.md` par le nom exact de ton fichier et `Division` par le titre que tu veux afficher.

## Lancer le site

Dans le terminal, dans ce dossier :

```bash
python3 -m http.server 8000
```

Puis ouvre http://localhost:8000 dans ton navigateur.

## Fonctionnalités

- Chaque question a son propre bouton "Vérifier la réponse"
- Quand tu réponds juste à UNE question, la petite danseuse 💃 danse juste à côté de ce bouton pendant 2 secondes
- Tu peux aussi cliquer "Vérifier toutes les réponses" en bas pour avoir un bilan global avec la grande danseuse
