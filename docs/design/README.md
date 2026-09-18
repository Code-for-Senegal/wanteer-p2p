# Références de conception

Ce dossier réunit les documents visuels qui ont circulé pendant le cadrage du
projet. Ils sont versionnés ici pour qu'une discussion sur un écart entre le
code et une maquette porte sur une référence que tout le monde peut ouvrir.

> **Statut : écartés.** Ni le nom, ni l'identité visuelle, ni les mises en page
> de ces documents ne peuvent être repris. Ils restent versionnés parce qu'ils
> documentent le cadrage et le domaine que l'API implémente déjà, mais ils ne
> sont plus une référence : un écart entre l'application et une de ces images
> n'est pas un bug.
>
> La référence fonctionnelle de la V1 est [`parcours-mvp.md`](parcours-mvp.md),
> qui décrit ce que l'application fait sans décrire à quoi elle ressemble.

## Contenu

| Fichier | Contenu | Origine |
| ------- | ------- | ------- |
| `00-blueprint-technique.png` | Plan directeur : pile technique, flux P2P, campagne 01 « Rentrée scolaire », liste des fonctionnalités clés. | _à compléter : auteur, date_ |
| `01-onboarding-inscription.jpg` | 5 écrans : découverte, les 4 types d'échange, saisie du téléphone, vérification OTP, choix du quartier. | _à compléter : auteur, date_ |
| `02-accueil.jpg` | 3 écrans : accueil (haut et suite du scroll) et sa variante en mode sombre. | _à compléter : auteur, date_ |
| `03-recherche-annonce.jpg` | 4 écrans : résultats de recherche, page annonce, offre, conversation. | _à compléter : auteur, date_ |

L'image `03` porte le numéro de page « 08 », ce qui indique que la série
complète des maquettes compte davantage d'écrans que les trois planches
présentes ici. Les planches manquantes seraient utiles.

## Les deux documents ne disent pas la même chose

Le blueprint et les maquettes décrivent deux produits différents. C'est un
constat, pas un jugement : les deux sont cohérents pris séparément.

| Sujet | Blueprint | Maquettes |
| ----- | --------- | --------- |
| Mise en relation | WhatsApp direct — « pas de chat interne, moins de code » | Messagerie interne avec offres intégrées |
| Numéro de téléphone | Exposé via un lien `wa.me` | « Votre numéro n'apparaît jamais sur vos annonces » |
| Prix | Zéro marge, statut « Prix-Coûtant » | Prix libre, « NÉGOCIABLE », offre et contre-offre |
| Pile | Astro/Tailwind, Supabase ou Firebase | _non spécifiée_ |
| Périmètre | Annonces, filtres, contact | + achat groupé, observatoire des prix, avis, livraison |

Arbitrage rendu : la V1 suit la logique du blueprint — mise en relation par
WhatsApp, pas de messagerie interne, pas de compte. Le code de l'API, lui, suit
encore les maquettes : voir la section « Designed for, not implemented » de
[`../architecture.md`](../architecture.md).

Un point reste ouvert. Le blueprint expose un numéro via un lien `wa.me`, la
maquette d'inscription promet « votre numéro n'apparaît jamais sur vos
annonces », et `CONTRIBUTING.md` interdit d'exposer un téléphone. L'application
ne l'affiche nulle part, mais l'auteur d'une annonce devient joignable. Trancher
entre un relais qui masque les deux numéros, une exposition assumée, ou un
consentement explicite par annonce est une décision d'équipe.

Trancher entre les deux est une décision d'équipe. Elle n'est pas prise ici.

## Mettre à jour ce dossier

Remplacer une image plutôt qu'en ajouter une version suffixée, pour que
l'historique Git reste la seule source de versions. Compresser avant de
committer : ce dossier doit rester sous le mégaoctet.
