import { VIDEOS } from '@/features/docs/content/SourcesContent.ts';
import '@/features/docs/styles/cards.css';
import { videoUrl } from '@/features/docs/lib/videoUrl.ts';

export function SourcesCard() {
  return (
    <article className="documentation-card">
      <h3>Sources</h3>
      <p>
        La partie théorique suit l'ordre de la série de vidéos de Guillaume Saint-Cirgue (Machine Learnia) sur les bases
        du machine learning :
      </p>
      <ul className="documentation-sources">
        {Object.values(VIDEOS).map((video) => (
          <li key={video.id}>
            <a className="documentation-link" href={videoUrl(video.id)} target="_blank" rel="noreferrer">
              {video.tag} · {video.title} ↗
            </a>
          </li>
        ))}
      </ul>
      <p>Les notions mathématiques, la normalisation et la vérification sont propres au projet.</p>
    </article>
  );
}
