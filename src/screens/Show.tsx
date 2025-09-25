import type { ScreenProps, MediaCard, MediaKind } from "./";


type Props = ScreenProps["Show"];

function Show({mediaCard, onBack}: Props) {
  return (
    <section>
      <button onClick={onBack}>&larr;</button>
      <h2>Show: </h2>
      <p>Description (if present)</p>
      <div style={{opacity:.6}}>Extras (trailers/interviews) — shell only</div>
    </section>
  );
}

export default Show;