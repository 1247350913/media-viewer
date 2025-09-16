function SeriesList({
  seriesId, onBack, onOpenMovie
}: { seriesId:string, onBack:()=>void, onOpenMovie:(movieId:string)=>void }) {
  const movies = [
    { id:'hp-1', title:'Philosopher\'s Stone', year:1997 },
    { id:'hp-2', title:'Chamber of Secrets', year:1998 },
  ];
  return (
    <section>
      <button onClick={onBack}>&larr;</button>
      <h2>{seriesId} — Films</h2>
      <ul>
        {movies.map(m=>(
          <li key={m.id}>
            <button onClick={()=>onOpenMovie(m.id)}>{m.title} ({m.year})</button>
          </li>
        ))}
      </ul>
      <div style={{opacity:.6}}>Order (non-F, shell)</div>
    </section>
  );
}

export default SeriesList;