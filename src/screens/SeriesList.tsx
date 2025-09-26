import type { ScreenProps, MediaCard, MediaKind } from "..";


type Props = ScreenProps["SeriesList"];

function SeriesList({mediaCard, onBack}: Props) {
  const movies = [
    { id:'hp-1', title:'Philosopher\'s Stone', year:1997 },
    { id:'hp-2', title:'Chamber of Secrets', year:1998 },
  ];
  return (
    <section>
      <button onClick={onBack}>&larr;</button>
      <h2> — Films</h2>
      <div style={{opacity:.6}}>Order (non-F, shell)</div>
    </section>
  );
}

export default SeriesList;