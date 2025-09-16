function Series({
  seriesId, onBack, onList
}: { seriesId:string, onBack:()=>void, onList:()=>void }) {
  return (
    <section>
      <button onClick={onBack}>&larr;</button>
      <h2>Series Hub: {seriesId}</h2>
      <button onClick={onList}>Movies</button>
      <div style={{opacity:.6}}>Extras — shell</div>
    </section>
  );
}

export default Series;