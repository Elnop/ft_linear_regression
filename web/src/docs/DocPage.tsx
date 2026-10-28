import type { CSSProperties, ReactNode } from 'react';
import csvSource from '../../../core/csv.ts?raw';
import gradientSource from '../../../core/gradient.ts?raw';
import hypothesisSource from '../../../core/hypothesis.ts?raw';
import metricsSource from '../../../core/metrics.ts?raw';
import normalizeSource from '../../../core/normalize.ts?raw';
import trainSource from '../../../core/train.ts?raw';
import { pick, tokenize } from './source.ts';
import './docs.css';

const REPO = 'https://github.com/Elnop/ft_linear_regression';

type Fn = {
  file: string;
  title: string;
  code: string;
  children: ReactNode;
};

const FUNCTIONS: Fn[] = [
  {
    file: 'core/hypothesis.ts',
    title: 'Le modèle',
    code: pick(hypothesisSource, 'estimatePrice'),
    children: (
      <>
        <p>
          Une droite : le prix estimé est <code>θ0 + θ1 × km</code>. <code>θ0</code> est le prix d'une voiture à 0 km,{' '}
          <code>θ1</code> la variation du prix par km (négative ici).
        </p>
        <p>
          C'est la seule fonction utilisée par <code>npm run predict</code>, et c'est elle qui place le marqueur de prix sur
          le mur.
        </p>
      </>
    ),
  },
  {
    file: 'core/gradient.ts',
    title: 'Une étape de descente',
    code: pick(gradientSource, 'gradientStep'),
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
    title: 'Normaliser le kilométrage',
    code: `${pick(normalizeSource, 'normalizeSamples')}\n\n${pick(normalizeSource, 'denormalizeThetas')}`,
    children: (
      <>
        <p>
          Les kilométrages vont de 22 899 à 240 000 : sur ces valeurs brutes, le gradient de <code>θ1</code> est des
          milliards de fois plus grand que celui de <code>θ0</code>, et la descente diverge sauf avec un learning rate
          minuscule.
        </p>
        <p>
          On ramène donc les km dans <code>[0, 1]</code> pour l'entraînement, puis on convertit les θ appris vers le
          kilométrage brut. Les θ sauvegardés s'utilisent tels quels dans <code>estimatePrice</code>.
        </p>
      </>
    ),
  },
  {
    file: 'core/train.ts',
    title: "L'entraînement",
    code: pick(trainSource, 'trainSteps'),
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
  {
    file: 'core/metrics.ts',
    title: 'Coût et précision',
    code: `${pick(metricsSource, 'cost')}\n\n${pick(metricsSource, 'r2')}`,
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
    file: 'core/csv.ts',
    title: 'Lire le dataset',
    code: pick(csvSource, 'parseDataset'),
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

export function DocPage({ style }: { style?: CSSProperties }) {
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
          sur 24 voitures. Tout le calcul tient dans <code>core/</code> : quelques fonctions pures, utilisées à
          l'identique par la CLI et par cette page. Le code ci-dessous est celui qui tourne.
        </p>
      </header>

      <div className="doc-fns">
        {FUNCTIONS.map((fn, i) => (
          <article key={fn.file} className="doc-fn">
            <div className="doc-text">
              <p className="doc-step">
                <span>{String(i + 1).padStart(2, '0')}</span>
                {fn.file}
              </p>
              <h3>{fn.title}</h3>
              {fn.children}
            </div>
            <Code code={fn.code} />
          </article>
        ))}
      </div>

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
            <code>core/</code> n'utilise aucune API Node et aucune dépendance : il tourne tel quel sous Node et dans le
            navigateur.
          </p>
          <p>
            Ici, rien n'est une image : le titre, les points et chaque droite sont pulvérisés en direct par un moteur de
            peinture (épaisseur de peinture par pixel, coulures simulées sur la rugosité du mur).
          </p>
          <p>
            <a className="doc-link" href={REPO} target="_blank" rel="noreferrer">
              Code source sur GitHub ↗
            </a>
          </p>
        </article>
      </div>
    </section>
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
