import type { ScreenProps, MediaCard, MediaKind } from "./";


type Props = ScreenProps["Seasons"];

function Seasons({mediaCard, onBack}: Props) {
  return (
    <section>
      <button onClick={onBack}>&larr;</button>
      <h2>Seasons --</h2>
    </section>
  );
}

export default Seasons;