import '@/features/docs/styles/page.css';

export function DocHeader() {
  return (
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
  );
}
