import { CLI, TREE } from '@/features/docs/content/ProjectContent.ts';
import { REPOSITORY } from '@/features/docs/content/SourcesContent.ts';
import '@/features/docs/styles/cards.css';
import '@/features/docs/styles/code.css';

export function ProjectCards() {
  return (
    <div className="documentation-grid">
      <article className="documentation-card">
        <h3>La CLI</h3>
        <p>Partie obligatoire, Node ≥ 22.18, sans build ni dépendance à l'exécution.</p>
        <pre className="documentation-code documentation-shell">{CLI}</pre>
      </article>
      <article className="documentation-card">
        <h3>Le projet</h3>
        <pre className="documentation-code documentation-shell">{TREE}</pre>
        <p>
          <code>core/</code> n'utilise aucune API Node et aucune dépendance : il tourne tel quel sous Node et dans le
          navigateur.
        </p>
        <p>
          Ici, rien n'est une image : le titre, les points et chaque droite sont pulvérisés en direct par un moteur de
          peinture (épaisseur de peinture par pixel, coulures simulées sur la rugosité du mur).
        </p>
        <p>
          <a className="documentation-link" href={REPOSITORY} target="_blank" rel="noreferrer">
            Code source sur GitHub ↗
          </a>
        </p>
      </article>
    </div>
  );
}
