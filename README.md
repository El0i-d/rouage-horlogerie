# Rouage — projet de démonstration

Site vitrine fictif d'une manufacture horlogère indépendante, conçu par
[Eloi Dupasquier](https://edupasquier.me) comme pièce de portfolio.

**Rouage n'est pas une marque réelle.** Aucune montre n'est en vente, aucun
formulaire n'envoie de données. Le site sert à démontrer une direction
visuelle (luxe sombre, laiton mat) et une architecture multi-pages complète.

## Architecture

```
index.html          → accueil : hero, manifeste, collection, savoir-faire, journal
collection.html     → index de la collection
solstice.html       → fiche produit RG-014-SL
nadir.html          → fiche produit RG-022-ND
arcane.html         → fiche produit RG-031-AR
maison.html         → la maison, engagements
savoir-faire.html   → anglage, décor, réglage
services.html       → garantie, entretien, prise de rendez-vous
styles.css          → système de design complet
script.js           → interactions
favicon.svg
```

## Parti pris

Aucune photographie. Toutes les illustrations — mouvement animé, cadrans,
schémas techniques légendés — sont du **SVG dessiné à la main**, ce qui
évite toute question de droits et donne au site une identité de dessin
technique plutôt que de catalogue photo.

Les cadrans affichent **l'heure réelle** du visiteur : les aiguilles sont
positionnées au chargement puis mises à jour chaque seconde.

## Détails d'implémentation

- **Enrichissement progressif** : le cadran de base (face, index, aiguilles)
  est en HTML statique ; `script.js` n'ajoute que la minuterie fine (60
  graduations) et le guillochage rayonnant. Sans JS, les cadrans restent
  lisibles.
- **`prefers-reduced-motion`** : animations, loader et aiguilles vivantes
  sont désactivés si le visiteur le demande.
- **Loader** affiché une seule fois par session (`sessionStorage`).
- **`noindex`** sur toutes les pages, pour ne pas concurrencer le vrai site
  d'Eloi Dupasquier dans les moteurs de recherche.

## Lancer en local

```bash
python -m http.server 8000
# puis ouvre http://localhost:8000
```

## Personnaliser

Palette, typographies, rythme d'espacement et courbes d'animation sont
centralisés dans le bloc `:root` en haut de `styles.css`
(`--gold`, `--signature`, `--serif`, `--mono`, `--ease`…).
