import { Formula } from '@/features/docs/components/presenters/Formula.tsx';
import type { DocStep } from '@/features/docs/types/DocsTypes.ts';

export const MATHS: DocStep[] = [
  {
    label: 'Notions mathématiques',
    section: 'Notions mathématiques',
    title: 'Les notations',
    aside: (
      <Formula>{`θ   thêta    paramètre du modèle : θ0, θ1
α   alpha    learning rate, la taille du pas
Σ   sigma    somme
∂   d rond   dérivée partielle
∇   nabla    gradient

x   feature  le kilométrage
y   target   le prix réel
m   nombre d'exemples (24)
i   numéro de l'exemple, de 1 à m
f   le modèle, f(x) = prix prédit
J   la fonction coût`}</Formula>
    ),
    children: (
      <>
        <p>
          Les mathématiques utilisent des lettres grecques pour nommer certaines quantités. Ce ne sont que des noms de
          variables, comme <code>lr</code> ou <code>theta0</code> dans le code.
        </p>
        <p>
          Ces notations sont celles de la vidéo et du sujet. <code>θ</code> désigne ce que la machine apprend,{' '}
          <code>α</code> un réglage choisi à la main avant l'entraînement.
        </p>
      </>
    ),
  },
  {
    label: 'Notions mathématiques',
    section: 'Notions mathématiques',
    title: 'La fonction affine',
    aside: (
      <Formula>{`f(x) = a · x + b

a   pente : variation de f quand x avance de 1
b   ordonnée à l'origine : f(0)

ici   a = θ1 ≈ −0.0214 €/km    b = θ0 ≈ 8 500 €
f(100 000) ≈ 8 500 − 2 140 = 6 360 €`}</Formula>
    ),
    children: (
      <>
        <p>
          Une droite s'écrit <code>a · x + b</code>. <code>b</code> est sa hauteur en <code>x = 0</code>,{' '}
          <code>a</code> son inclinaison : positive elle monte, négative elle descend.
        </p>
        <p>
          Deux nombres suffisent à décrire n'importe quelle droite. Apprendre le modèle revient donc à trouver ces deux
          nombres, notés <code>θ0</code> et <code>θ1</code>.
        </p>
      </>
    ),
  },
  {
    label: 'Notions mathématiques',
    section: 'Notions mathématiques',
    title: 'Le symbole Σ',
    aside: (
      <Formula>{`Σ u[i]   (i de 1 à m)   =   u[1] + u[2] + … + u[m]

Σ i²     (i de 1 à 3)   =   1 + 4 + 9 = 14

let s = 0;
for (let i = 1; i <= m; i++) s += u[i];`}</Formula>
    ),
    children: (
      <>
        <p>
          La lettre grecque <strong>sigma</strong> veut dire « la somme de ». On fait varier l'indice <code>i</code> du
          premier au dernier exemple et on additionne tous les termes.
        </p>
        <p>
          En code, c'est une simple boucle <code>for</code> qui accumule. Diviser par <code>m</code> une somme donne
          une moyenne.
        </p>
      </>
    ),
  },
  {
    label: 'Notions mathématiques',
    section: 'Notions mathématiques',
    title: 'La dérivée',
    aside: (
      <Formula>{`f'(x) = pente de la tangente en x

f(x) = c        f'(x) = 0
f(x) = a · x    f'(x) = a
f(x) = x²       f'(x) = 2x

f' < 0   la courbe descend
f' > 0   la courbe monte
f' = 0   un creux (ou un sommet)`}</Formula>
    ),
    children: (
      <>
        <p>
          La dérivée <code>f'(x)</code> mesure la pente de la courbe au point <code>x</code> : de combien{' '}
          <code>f</code> varie si on bouge <code>x</code> d'un tout petit peu.
        </p>
        <p>
          Son signe dit dans quel sens la courbe va, et elle vaut zéro au fond d'un creux. Une
          fonction <strong>convexe</strong>, en forme de bol, n'a qu'un seul creux : son minimum.
        </p>
      </>
    ),
  },
  {
    label: 'Notions mathématiques',
    section: 'Notions mathématiques',
    title: 'Dérivées partielles',
    aside: (
      <Formula>{`g(θ0, θ1) = θ0² + 3 · θ0 · θ1

∂g/∂θ0 = 2θ0 + 3θ1    θ1 traité comme une constante
∂g/∂θ1 = 3θ0          θ0 traité comme une constante

gradient   ∇g = ( ∂g/∂θ0 , ∂g/∂θ1 )`}</Formula>
    ),
    children: (
      <>
        <p>
          Quand une fonction dépend de plusieurs variables, on la dérive par rapport à une seule en figeant les autres :
          c'est une dérivée partielle, notée <code>∂</code>.
        </p>
        <p>
          Le vecteur de toutes les dérivées partielles est le <strong>gradient</strong>. Il pointe vers la montée la
          plus raide. La descente de gradient va dans le sens opposé.
        </p>
      </>
    ),
  },
  {
    label: 'Notions mathématiques',
    section: 'Notions mathématiques',
    title: 'Fonctions composées',
    aside: (
      <Formula>{`( g(h(x)) )' = g'(h(x)) · h'(x)

( u² )' = 2u · u'

u = θ0 + θ1 · x − y
∂u/∂θ0 = 1          ∂u/∂θ1 = x
∂(u²)/∂θ0 = 2u      ∂(u²)/∂θ1 = 2u · x`}</Formula>
    ),
    children: (
      <>
        <p>
          Une fonction composée applique une fonction au résultat d'une autre, comme le carré d'une erreur. Sa dérivée
          est la dérivée de l'extérieur multipliée par celle de l'intérieur : la{' '}
          <strong>règle de la chaîne</strong>.
        </p>
        <p>
          C'est elle qui donne les formules du sujet : l'erreur au carré se dérive en <code>2 × erreur</code>, multiplié
          par <code>1</code> pour <code>θ0</code> et par <code>x</code> pour <code>θ1</code>.
        </p>
      </>
    ),
  },
];
