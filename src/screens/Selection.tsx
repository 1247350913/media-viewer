function Selection({
  movieId, onBack, onPlay
}: { movieId:string, onBack:()=>void, onPlay:()=>void }) {
  return (
    <section>
      <button onClick={onBack}>&larr;</button>
      <h2>Movie: {movieId}</h2>
      <p>Description if present. Audio/Subs (non-F for MVP).</p>
      <button onClick={onPlay}>Play in FVP</button>
    </section>
  );
}
export default Selection;