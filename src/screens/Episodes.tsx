function Episodes({
  showId, seasonNo, onBack, onPlayEpisode
}: { showId:string, seasonNo:number, onBack:()=>void, onPlayEpisode:(n:number)=>void }) {
  return (
    <section>
      <button onClick={onBack}>&larr;</button>
      <h2>{showId} — Season {seasonNo}</h2>
      <ul>
        {[1,2,3,4,5].map(ep=>(
          <li key={ep}>
            <button onClick={()=>onPlayEpisode(ep)}>{ep}. Episode Title (meta)</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Episodes;