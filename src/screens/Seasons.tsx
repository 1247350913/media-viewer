function Seasons({
  showId, onBack, onPickSeason
}: { showId:string, onBack:()=>void, onPickSeason:(n:number)=>void }) {
  return (
    <section>
      <button onClick={onBack}>&larr;</button>
      <h2>Seasons — {showId}</h2>
      <ul>
        {[1,2,3,4].map(n=>(
          <li key={n}>
            <button onClick={()=>onPickSeason(n)}>Season {n} (xx eps)</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Seasons;