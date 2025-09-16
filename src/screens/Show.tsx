function Show({
  showId, onBack, onSeasons, onExtras
}: { showId:string, onBack:()=>void, onSeasons:()=>void, onExtras:()=>void }) {
  return (
    <section>
      <button onClick={onBack}>&larr;</button>
      <h2>Show: {showId}</h2>
      <button onClick={onSeasons}>Seasons</button>
      <p>Description (if present)</p>
      <div style={{opacity:.6}}>Extras (trailers/interviews) — shell only</div>
    </section>
  );
}

export default Show;