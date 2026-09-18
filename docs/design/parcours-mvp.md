# Parcours du MVP

Ce document décrit ce que l'application mobile doit faire. Il ne décrit ni une
mise en page, ni une identité visuelle : celles-ci restent à concevoir, et rien
de ce qui a circulé pendant le cadrage ne peut être repris tel quel.

## Les quatre types d'échange

Une annonce a exactement un type. Ils sont déjà modélisés dans
`@p2p-local/types` :

| Libellé      | Type      | Prix                                  |
| ------------ | --------- | ------------------------------------- |
| Donner       | `DONATION`| aucun                                 |
| Troquer      | `BARTER`  | aucun                                 |
| Prix coûtant | `SALE`    | obligatoire, en francs CFA, sans marge |
| Besoin       | `REQUEST` | facultatif                            |

Le prix coûtant est le prix d'achat, sans marge spéculative. C'est une promesse
du produit, pas une case à cocher : si elle n'est pas tenue, l'annonce relève de
la vente ordinaire et n'a pas sa place ici.

## Trouver

1. La personne ouvre l'application. Un quartier est déjà sélectionné ; elle peut
   en changer dans une liste fermée.
2. Elle voit les annonces de ce quartier, les plus récentes d'abord.
3. Elle filtre par type, ou cherche dans les titres.
4. Elle ouvre une annonce : photo, type, titre, description, quartier et
   ancienneté.

Le filtre est un **quartier choisi à la main**, pas un rayon GPS. Le public visé
a un forfait limité et n'active pas sa localisation pour chercher un cahier.

## Contacter

1. Sur une annonce, un bouton ouvre WhatsApp.
2. Avant l'ouverture, la personne renseigne son prénom, une fois pour toutes.
3. WhatsApp s'ouvre avec un message pré-rempli qui nomme l'annonce, pour que le
   destinataire sache d'où vient le contact.
4. Sous le bouton, un avertissement permanent : l'application ne demande jamais
   d'acompte ni de code Wave ou Orange Money.

**Aucun numéro n'est affiché.** Ni dans une annonce, ni dans un bouton, ni dans
un texte partagé. Un numéro visible en clair attire les robots collecteurs, le
démarchage et les tentatives d'escroquerie, et il expose particulièrement les
femmes. Le numéro ne sert qu'à construire le lien, au moment du geste.

## Publier

1. Un bouton unique, visible depuis l'accueil.
2. Quatre champs : photo, type, quartier, description. Un cinquième, le prix,
   n'apparaît que pour le prix coûtant.
3. Aucun compte n'est demandé. Le numéro WhatsApp de l'auteur est un réglage
   renseigné une seule fois.
4. L'annonce est publiée ; elle apparaît immédiatement dans la liste.

L'objectif est une minute, sur un téléphone d'entrée de gamme, avec une
connexion lente.

## Gérer son annonce

Sans compte, la propriété d'une annonce tient à la clé d'administration écrite
sur l'appareil au moment de la publication.

| Action                  | Effet                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| Marquer comme donné     | L'annonce reste visible 48 h, grisée, avec un badge ; le contact est désactivé, puis elle est archivée. |
| Supprimer définitivement | L'annonce et sa photo sont effacées immédiatement, sans corbeille.                             |
| Expiration automatique  | Toute annonce est archivée d'elle-même au bout de 30 jours.                                     |

Garder une annonce accomplie visible pendant deux jours n'est pas un détail
technique : c'est ce qui rend l'entraide du quartier visible.

## Partager

Une annonce se partage sous forme de texte : titre, type, quartier. Le partage
est aujourd'hui le seul canal de diffusion réel, puisque rien n'est publié sur
un serveur.

C'est aussi la limite la plus lourde de ce MVP : **une annonce publiée n'est
visible que sur le téléphone qui l'a publiée.** Tant qu'il n'y a pas de backend,
le texte partagé ne peut pas renvoyer vers une page consultable.

## Hors périmètre du MVP

- Notifications : rien ne peut en produire sans serveur.
- Messagerie interne : la mise en relation passe par WhatsApp, volontairement.
- Comptes, offres, avis, achat groupé, observatoire des prix.
