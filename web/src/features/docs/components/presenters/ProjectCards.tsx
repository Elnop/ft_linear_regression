import { CLI, TREE } from '@/features/docs/content/project.ts';
import { REPO } from '@/features/docs/content/sources.ts';
import '@/features/docs/styles/cards.css';
import '@/features/docs/styles/code.css';

export function ProjectCards() {
  return (
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
  );
}
