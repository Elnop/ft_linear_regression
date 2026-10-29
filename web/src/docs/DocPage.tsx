import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import csvSource from '../../../core/csv.ts?raw';
import gradientSource from '../../../core/gradient.ts?raw';
import hypothesisSource from '../../../core/hypothesis.ts?raw';
import metricsSource from '../../../core/metrics.ts?raw';
import normalizeSource from '../../../core/normalize.ts?raw';
import trainSource from '../../../core/train.ts?raw';
import { pick, tokenize } from './source.ts';
import './docs.css';

const REPO = 'https://github.com/Elnop/ft_linear_regression';

const VIDEOS = {
  ml1: { id: 'EUD07IiviJg', tag: 'ML#1', title: 'Formation Machine Learning (2019)' },
  ml3: { id: 'wg7-roETbbM', tag: 'ML#3', title: 'La régression linéaire (partie 1/2)' },
  ml4: { id: 'rcl_YRyoLIY', tag: 'ML#4', title: 'Descente de gradient' },
} as const;

const videoUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

type Step = {
  section: string;
  label: string;
  title: string;
  aside: ReactNode;
  children: ReactNode;
};

const THEORY: Step[] = [
  {
    label: 'Introduction',
    section: 'Introduction',
    title: 'Le machine learning',
    aside: (
      <Formula>{`programmation classique   règles écrites à la main  →  réponse
machine learning          exemples  →  modèle appris  →  réponse`}</Formula>
    ),
    children: (
      <>
        <p>
          Le machine learning, c'est donner à une machine la capacité d'<strong>apprendre</strong> sans la programmer
          de façon explicite.
        </p>
        <p>
          Impossible d'écrire à la main une règle de prix pour chaque voiture possible. À la place, on montre des
          exemples à la machine et elle en déduit la règle.
        </p>
      </>
    ),
  },
  {
    label: 'Introduction',
    section: 'Introduction',
    title: 'Apprentissage supervisé',
    aside: (
      <Formula>{`régression       y continu   prix d'une voiture  ← ce projet
classification   y discret   spam (1) ou non (0)`}</Formula>
    ),
    children: (
      <>
        <p>
          Comme un élève avec un professeur, la machine étudie des exemples dont on connaît la réponse : des paires{' '}
          <code>(x, y)</code> rassemblées dans un tableau, le <strong>dataset</strong>. Elle en tire un{' '}
          <strong>modèle</strong>, la relation qui relie <code>x</code> à <code>y</code>.
        </p>
        <p>
          Prédire un prix, qui peut prendre une infinité de valeurs, est un problème de <strong>régression</strong>.
          Prédire une catégorie serait un problème de classification.
        </p>
      </>
    ),
  },
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
          Son <strong>signe</strong> dit dans quel sens la courbe va, et elle vaut zéro au fond d'un creux. Une
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
          c'est une <strong>dérivée partielle</strong>, notée <code>∂</code>.
        </p>
        <p>
          Le vecteur de toutes les dérivées partielles est le <strong>gradient</strong>. Il pointe vers la montée la
          plus raide ; la descente de gradient va dans le sens opposé.
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
  {
    label: 'Apprentissage supervisé',
    section: 'Régression linéaire',
    title: 'Les 4 étapes',
    aside: (
      <Formula>{`1. un dataset    (x, y)
2. un modèle     f(x), avec des paramètres θ
3. une fonction coût   J(θ)
4. un algorithme qui minimise J`}</Formula>
    ),
    children: (
      <>
        <p>
          Tout problème d'apprentissage supervisé se résout avec les quatre mêmes briques. Le conseil de base : les
          écrire sur papier avant de coder, avec les dimensions du dataset.
        </p>
        <p>Ici : le prix d'une voiture à partir de son kilométrage. La suite les prend dans l'ordre.</p>
      </>
    ),
  },
  {
    label: 'Étape 1',
    section: 'Régression linéaire',
    title: 'Le dataset',
    aside: (
      <Formula>{`m = 24   exemples (lignes)
n = 1    feature  (le km)

x[1] = 240 000 km   y[1] = 3 650 €
x[2] = 139 800 km   y[2] = 3 800 €
…`}</Formula>
    ),
    children: (
      <>
        <p>
          <code>data.csv</code> contient 24 voitures. Chaque ligne est un exemple : une <strong>feature</strong>{' '}
          <code>x</code> (le kilométrage) et une <strong>target</strong> <code>y</code> (le prix).
        </p>
        <p>
          On note <code>m</code> le nombre d'exemples, <code>n</code> le nombre de features, et <code>x[i]</code>,{' '}
          <code>y[i]</code> le i-ème exemple.
        </p>
      </>
    ),
  },
  {
    label: 'Étape 2',
    section: 'Régression linéaire',
    title: 'Le modèle',
    aside: <Formula>{`f(x) = θ0 + θ1 · x`}</Formula>,
    children: (
      <>
        <p>
          On impose à la machine la forme du modèle : une droite. <code>θ0</code> est le prix à 0 km, <code>θ1</code> la
          variation du prix par km.
        </p>
        <p>
          La machine ne connaît pas ces paramètres : c'est à elle de les trouver. Elle part de <code>θ0 = θ1 = 0</code>,
          une droite plate à 0 €, très loin des points.
        </p>
      </>
    ),
  },
  {
    label: 'Étape 3',
    section: 'Régression linéaire',
    title: "Mesurer l'erreur",
    aside: (
      <Formula>{`erreur[i] = f(x[i]) − y[i]

prix réel   6 000 €
prédit      5 000 €   → erreur −1 000
prédit      7 000 €   → erreur +1 000
au carré               → 1 000 000 dans les deux cas`}</Formula>
    ),
    children: (
      <>
        <p>
          Pour chaque voiture, l'erreur est l'écart entre le prix prédit et le prix réel. Elle peut être négative : on
          la met <strong>au carré</strong> pour que seule sa taille compte.
        </p>
        <p>Le carré pénalise aussi davantage les grosses erreurs que les petites.</p>
      </>
    ),
  },
  {
    label: 'Étape 3',
    section: 'Régression linéaire',
    title: 'La fonction coût',
    aside: <Formula>{`J(θ0, θ1) = 1/(2m) · Σ ( f(x[i]) − y[i] )²`}</Formula>,
    children: (
      <>
        <p>
          Plutôt qu'une erreur par voiture, on les résume toutes en un seul nombre : la moyenne des erreurs au carré,
          l'<strong>erreur quadratique moyenne</strong> (MSE). Le <code>½</code> sert seulement à simplifier la dérivée.
        </p>
        <p>
          <code>J</code> ne dépend que de <code>θ0</code> et <code>θ1</code> : le dataset, lui, ne change pas. Trouver la
          meilleure droite revient à trouver les θ qui rendent <code>J</code> minimal.
        </p>
      </>
    ),
  },
  {
    label: 'Étape 4',
    section: 'Régression linéaire',
    title: 'Minimiser le coût',
    aside: (
      <Formula>{`moindres carrés    J'(θ) = 0, résolu d'un coup
descente de gradient   petits pas, répétés`}</Formula>
    ),
    children: (
      <>
        <p>
          <code>J</code> est une somme de carrés : sa courbe est un bol (une fonction <strong>convexe</strong>), avec un
          seul minimum.
        </p>
        <p>
          On peut le trouver directement avec les <strong>moindres carrés</strong> (là où la dérivée s'annule), mais ça
          demande d'inverser une matrice, beaucoup trop coûteux avec des millions d'exemples. En machine learning on
          utilise la <strong>descente de gradient</strong>, et le sujet l'impose.
        </p>
      </>
    ),
  },
  {
    label: 'Descente de gradient',
    section: 'Descente de gradient',
    title: 'Perdu dans la montagne',
    aside: <DescentFigure />,
    children: (
      <>
        <p>
          Vous êtes perdu en montagne, sans carte, et le refuge est au point le plus bas de la vallée. Stratégie :
          regarder autour de soi où la pente descend le plus fort, marcher un peu dans cette direction, puis
          recommencer.
        </p>
        <p>
          La vallée, c'est <code>J</code>. On part de θ au hasard (ici 0), on calcule la pente (la dérivée), on fait un
          petit pas vers le bas, et on répète jusqu'au fond.
        </p>
      </>
    ),
  },
  {
    label: 'Descente de gradient',
    section: 'Descente de gradient',
    title: 'La formule',
    aside: (
      <Formula>{`θ ← θ − α · ∂J/∂θ

pente < 0  →  θ − (négatif)  →  θ augmente
pente > 0  →  θ − (positif)  →  θ diminue`}</Formula>
    ),
    children: (
      <>
        <p>
          À chaque itération, on retire à chaque paramètre la pente multipliée par <code>α</code>, le{' '}
          <strong>learning rate</strong> (toujours positif).
        </p>
        <p>
          Quel que soit le côté de la vallée où l'on démarre, le signe de la dérivée pousse θ vers le minimum. Mise
          dans une boucle, cette seule ligne devient l'algorithme.
        </p>
      </>
    ),
  },
  {
    label: 'Descente de gradient',
    section: 'Descente de gradient',
    title: 'Le learning rate',
    aside: (
      <Formula>{`α trop grand  →  saute par-dessus le minimum, diverge
α trop petit  →  converge, mais très lentement

sur ce dataset (km normalisés) :
α = 0.5  →  converge
α = 3    →  diverge à l'itération 788`}</Formula>
    ),
    children: (
      <>
        <p>
          <code>α</code> règle la taille du pas. Trop grand, on rebondit d'un flanc de la vallée à l'autre, de plus en
          plus haut. Trop petit, il faut un nombre d'itérations énorme.
        </p>
        <p>Il n'y a pas de formule magique : on essaie plusieurs valeurs. Le curseur du mur permet de le tester.</p>
      </>
    ),
  },
  {
    label: 'Descente de gradient',
    section: 'Descente de gradient',
    title: 'Calculer le gradient',
    aside: (
      <Formula>{`∂J/∂θ0 = 1/m · Σ ( f(x[i]) − y[i] )
∂J/∂θ1 = 1/m · Σ ( f(x[i]) − y[i] ) · x[i]

tmpθ0 = α · ∂J/∂θ0     θ0 = θ0 − tmpθ0
tmpθ1 = α · ∂J/∂θ1     θ1 = θ1 − tmpθ1`}</Formula>
    ),
    children: (
      <>
        <p>
          Il reste à calculer les dérivées. <code>J</code> est une fonction composée : le carré descend et s'annule avec
          le <code>½</code>, puis on multiplie par la dérivée de l'intérieur, <code>1</code> pour <code>θ0</code> et{' '}
          <code>x[i]</code> pour <code>θ1</code>.
        </p>
        <p>
          On retrouve exactement les formules du sujet. Les deux sont calculées avec les mêmes θ, ceux d'avant
          l'itération : c'est la <strong>mise à jour simultanée</strong>.
        </p>
      </>
    ),
  },
  {
    label: 'Le projet',
    section: 'Le projet',
    title: 'Normaliser le kilométrage',
    aside: (
      <Formula>{`x_norm = (x − min) / (max − min)      ∈ [0, 1]

après l'entraînement :
θ0 = θ0n − θ1n · min / (max − min)
θ1 = θ1n / (max − min)`}</Formula>
    ),
    children: (
      <>
        <p>
          Les km vont de 22 899 à 240 000. Le gradient de <code>θ1</code>, multiplié par <code>x</code>, est alors des
          milliards de fois plus grand que celui de <code>θ0</code> : aucun α ne convient aux deux.
        </p>
        <p>
          On ramène donc les km dans <code>[0, 1]</code> pour l'entraînement, puis on convertit les θ appris vers les km
          bruts. La prédiction applique ensuite la formule du sujet telle quelle.
        </p>
      </>
    ),
  },
  {
    label: 'Le projet',
    section: 'Le projet',
    title: 'Vérifier le résultat',
    aside: (
      <Formula>{`                  θ0             θ1
moindres carrés   8499.599649933  −0.021448963592
descente          8499.599649933  −0.021448963592

R² = 0.733`}</Formula>
    ),
    children: (
      <>
        <p>
          La solution exacte des moindres carrés n'est pas utilisée par le programme, mais elle sert de témoin : après
          10 000 itérations à <code>α = 0.5</code>, la descente tombe dessus.
        </p>
        <p>
          Le R² indique que la droite explique 73 % de la variance des prix. Le reste dépend de ce que le modèle ignore :
          âge, marque, état.
        </p>
      </>
    ),
  },
];

const CODE: (Omit<Step, 'label'> & { file: string })[] = [
  {
    file: 'core/csv.ts',
    section: 'Le modèle',
    title: 'Lire le dataset',
    aside: <Code code={pick(csvSource, 'parseDataset')} />,
    children: (
      <>
        <p>
          Reçoit le texte du CSV, pas un chemin : <code>core/</code> n'utilise aucune API Node. La CLI lit le fichier,
          le web l'importe au build.
        </p>
        <p>Toute ligne invalide lève une erreur avec son numéro ; la CLI l'affiche sur la sortie d'erreur et quitte avec un code non nul.</p>
      </>
    ),
  },
  {
    file: 'core/hypothesis.ts',
    section: 'Le modèle',
    title: 'Estimer un prix',
    aside: <Code code={pick(hypothesisSource, 'estimatePrice')} />,
    children: (
      <>
        <p>
          La droite <code>θ0 + θ1 × km</code>, telle que le sujet l'écrit.
        </p>
        <p>
          C'est la seule fonction utilisée par <code>npm run predict</code>, et c'est elle qui place le marqueur de prix sur
          le mur.
        </p>
      </>
    ),
  },
  {
    file: 'core/metrics.ts',
    section: 'Le modèle',
    title: 'Coût et précision',
    aside: <Code code={`${pick(metricsSource, 'cost')}\n\n${pick(metricsSource, 'r2')}`} />,
    children: (
      <>
        <p>
          Le coût <code>J</code> est l'erreur quadratique moyenne divisée par 2 : c'est ce que la descente minimise, et la
          courbe du panneau COÛT.
        </p>
        <p>
          Le R² mesure la part de la variance des prix expliquée par la droite : <strong>0.733</strong> sur ce dataset.
          RMSE et MAE donnent l'erreur typique en euros.
        </p>
      </>
    ),
  },
  {
    file: 'core/gradient.ts',
    section: "L'entraînement",
    title: 'Une étape de descente',
    aside: <Code code={pick(gradientSource, 'gradientStep')} />,
    children: (
      <>
        <p>
          Les formules imposées par le sujet. Une seule boucle accumule les deux sommes d'erreurs, puis{' '}
          <code>tmpθ0</code> et <code>tmpθ1</code> sont calculés.
        </p>
        <p>
          <strong>Mise à jour simultanée</strong> : les deux sommes utilisent les mêmes θ, ceux d'avant l'itération. La
          fonction renvoie un nouvel objet, l'ancien n'est jamais modifié.
        </p>
      </>
    ),
  },
  {
    file: 'core/normalize.ts',
    section: "L'entraînement",
    title: 'Normaliser le kilométrage',
    aside: <Code code={`${pick(normalizeSource, 'normalizeSamples')}\n\n${pick(normalizeSource, 'denormalizeThetas')}`} />,
    children: (
      <>
        <p>
          Min-max sur les km pour l'entraînement, puis conversion des θ appris vers le kilométrage brut.
        </p>
        <p>
          Les θ sauvegardés s'utilisent donc tels quels dans <code>estimatePrice</code>.
        </p>
      </>
    ),
  },
  {
    file: 'core/train.ts',
    section: "L'entraînement",
    title: 'La boucle de descente',
    aside: <Code code={pick(trainSource, 'trainSteps')} />,
    children: (
      <>
        <p>
          Un générateur : il produit l'état après chaque itération (θ sur km brut et coût). L'itération 0 est l'état
          initial, <code>θ0 = θ1 = 0</code>. Il s'arrête dès qu'un θ devient infini : c'est la divergence.
        </p>
        <p>
          La CLI le parcourt jusqu'au bout et écrit <code>model.json</code>. Cette page consomme le{' '}
          <strong>même générateur</strong> et peint un passage aux itérations 0, 1, 2, 4, 8… : la droite finale est
          exactement celle de la CLI.
        </p>
      </>
    ),
  },
];

const CLI = `$ npm run train
Dataset: data.csv (24 samples)
Training: lr=0.5, iterations=10000
Done: theta0=8499.599649933207  theta1=-0.02144896359170222  cost=222822.62
Saved to model.json

$ npm run predict
Mileage (km): 100000
Estimated price: 6354.70

$ npm run precision
R²:   0.7330
RMSE: 667.57
MAE:  557.84  (8.8% of the mean price)

$ npm run train -- data.csv --lr 3
Error: training diverged at iteration 788, model not saved (try a smaller --lr)`;

const TREE = `core/  calcul pur, partagé
cli/   train, predict, precision
web/   cette page (React, WebGL)
docs/  documentation détaillée`;

const TABS = [
  { id: 'theory', label: 'Théorie' },
  { id: 'code', label: 'Code' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function DocPage({ style }: { style?: CSSProperties }) {
  const [tab, setTab] = useState<TabId>('theory');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onTabKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + TABS.length) % TABS.length;
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="doc" className="doc glass wu-hit" style={style} aria-labelledby="doc-title">
      <span className="tape" style={{ left: 48, transform: 'rotate(-4deg)' }} />
      <span className="tape" style={{ right: 64, transform: 'rotate(5deg)' }} />

      <header className="doc-head">
        <p className="label">Documentation</p>
        <h2 id="doc-title" className="doc-title">
          Comment la droite est trouvée
        </h2>
        <p className="doc-lead">
          Régression linéaire du prix d'une voiture en fonction de son kilométrage, entraînée par descente de gradient
          sur 24 voitures. La théorie d'abord, puis le code qui la met en œuvre : celui qui tourne, utilisé à
          l'identique par la CLI et par cette page.
        </p>
      </header>

      <div className="doc-tabs" role="tablist" aria-label="Sections de la documentation">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`doc-tab-${t.id}`}
            className="doc-tab"
            aria-selected={tab === t.id}
            aria-controls={`doc-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`doc-panel-${tab}`}
        aria-labelledby={`doc-tab-${tab}`}
        className="doc-panel"
      >
        {tab === 'theory' ? (
          <>
            <Steps steps={THEORY} prefix="theory" />
            <article className="doc-card">
              <h3>Sources</h3>
              <p>
                La partie théorique suit l'ordre de la série de vidéos de Guillaume Saint-Cirgue (Machine Learnia) sur
                les bases du machine learning :
              </p>
              <ul className="doc-sources">
                {Object.values(VIDEOS).map((v) => (
                  <li key={v.id}>
                    <a className="doc-link" href={videoUrl(v.id)} target="_blank" rel="noreferrer">
                      {v.tag} · {v.title} ↗
                    </a>
                  </li>
                ))}
              </ul>
              <p>Les notions mathématiques, la normalisation et la vérification sont propres au projet.</p>
            </article>
          </>
        ) : (
          <>
            <Steps steps={CODE.map((s) => ({ ...s, label: s.file }))} prefix="code" />
            <div className="doc-grid">
              <article className="doc-card">
                <h3>La CLI</h3>
                <p>Partie obligatoire, Node ≥ 22.18, sans build ni dépendance à l'exécution.</p>
                <pre className="doc-code doc-shell">{CLI}</pre>
              </article>
              <article className="doc-card">
                <h3>Le projet</h3>
                <pre className="doc-code doc-shell">{TREE}</pre>
                <p>
                  <code>core/</code> n'utilise aucune API Node et aucune dépendance : il tourne tel quel sous Node et
                  dans le navigateur.
                </p>
                <p>
                  Ici, rien n'est une image : le titre, les points et chaque droite sont pulvérisés en direct par un
                  moteur de peinture (épaisseur de peinture par pixel, coulures simulées sur la rugosité du mur).
                </p>
                <p>
                  <a className="doc-link" href={REPO} target="_blank" rel="noreferrer">
                    Code source sur GitHub ↗
                  </a>
                </p>
              </article>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Steps({ steps, prefix }: { steps: Step[]; prefix: string }) {
  const id = (i: number) => `doc-${prefix}-${i + 1}`;
  const num = (i: number) => String(i + 1).padStart(2, '0');
  const sections: { title: string; items: { step: Step; i: number }[] }[] = [];
  steps.forEach((step, i) => {
    const last = sections.at(-1);
    if (last?.title === step.section) last.items.push({ step, i });
    else sections.push({ title: step.section, items: [{ step, i }] });
  });

  return (
    <>
      <nav className="doc-toc" aria-label="Sommaire">
        <p className="label">Sommaire</p>
        <div className="doc-toc-sections">
          {sections.map((sec) => (
            <div key={sec.title}>
              <p className="doc-toc-title">{sec.title}</p>
              <ol>
                {sec.items.map(({ step, i }) => (
                  <li key={step.title}>
                    <a
                      href={`#${id(i)}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(id(i))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <span>{num(i)}</span>
                      {step.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </nav>
      <div className="doc-fns">
        {steps.map((s, i) => (
          <article key={s.title} id={id(i)} className="doc-fn">
            <div className="doc-text">
              <p className="doc-step">
                <span>{num(i)}</span>
                {s.label}
              </p>
              <h3>{s.title}</h3>
              {s.children}
            </div>
            {s.aside}
          </article>
        ))}
      </div>
    </>
  );
}

function Formula({ children }: { children: string }) {
  return <pre className="doc-code doc-math">{children}</pre>;
}

function DescentFigure() {
  const curve = (x: number) => 195 - 0.0052 * (x - 200) ** 2;
  const path = Array.from({ length: 41 }, (_, i) => {
    const x = 20 + i * 9;
    return `${i ? 'L' : 'M'}${x},${curve(x).toFixed(1)}`;
  }).join(' ');
  const steps = [40, 105, 148, 176, 191];

  return (
    <figure className="doc-code doc-figure">
      <svg viewBox="0 0 400 230" role="img" aria-label="Courbe du coût J en forme de bol, avec des pas successifs qui descendent vers le minimum">
        <line x1="20" y1="210" x2="390" y2="210" className="fig-axis" />
        <line x1="20" y1="10" x2="20" y2="210" className="fig-axis" />
        <text x="384" y="226" className="fig-label" textAnchor="end">θ</text>
        <text x="28" y="22" className="fig-label">J(θ)</text>
        <path d={path} className="fig-curve" />
        {steps.slice(1).map((x, i) => (
          <line key={x} x1={steps[i]} y1={curve(steps[i])} x2={x} y2={curve(x)} className="fig-step" />
        ))}
        {steps.map((x, i) => (
          <circle key={x} cx={x} cy={curve(x)} r={i ? 4 : 6} className="fig-dot" />
        ))}
        <text x={steps[0] + 10} y={curve(steps[0]) + 4} className="fig-label">départ</text>
        <line x1="200" y1="182" x2="200" y2="210" className="fig-min" />
        <text x="200" y="174" className="fig-label" textAnchor="middle">minimum</text>
      </svg>
      <figcaption>Chaque pas suit la pente ; les pas raccourcissent à mesure que la pente s'aplatit.</figcaption>
    </figure>
  );
}

function Code({ code }: { code: string }) {
  return (
    <pre className="doc-code">
      <code>
        {tokenize(code).map((t, i) =>
          t.kind === 'text' ? t.text : (
            <span key={i} className={`tk-${t.kind}`}>
              {t.text}
            </span>
          ),
        )}
      </code>
    </pre>
  );
}
