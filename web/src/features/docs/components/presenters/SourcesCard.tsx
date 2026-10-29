import { VIDEOS, videoUrl } from '@/features/docs/content/sources.ts';

export function SourcesCard() {
  return (
    <article className="doc-card">
      <h3>Sources</h3>
      <p>
        La partie théorique suit l'ordre de la série de vidéos de Guillaume Saint-Cirgue (Machine Learnia) sur les bases
        du machine learning :
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
  );
}
