# Rouage — projet de démonstration

Site vitrine fictif pour une "manufacture horlogère indépendante", conçu par
[Eloi Dupasquier](https://edupasquier.me) comme pièce de portfolio.

**Rouage n'est pas une marque réelle.** Aucune montre présentée n'est en
vente ; le site sert uniquement à démontrer une direction visuelle (luxe
sombre, laiton mat) différente du site personnel.

Site statique (HTML / CSS / JS), sans dépendance ni étape de build.
Toutes les illustrations (mouvement, cadrans, schéma technique) sont du
SVG dessiné à la main — aucune photo, pour rester 100 % libre de droits.

## Lancer en local

```bash
python -m http.server 8000
# puis ouvre http://localhost:8000
```

## Personnaliser le style

Palette et typographies centralisées dans `:root` en haut de `styles.css`
(`--gold`, `--signature`, `--serif`, `--mono`…).
