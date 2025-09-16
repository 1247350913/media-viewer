import { type ScreenProps } from ".";

type Props = ScreenProps["MediaType"];

function MediaType({ value, onPick }: Props) {
  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Browse</h2>
      <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:16 }}>
        <button onClick={() => onPick('all')}    aria-pressed={value==='all'}>All</button>
        <button onClick={() => onPick('movies')} aria-pressed={value==='movies'}>Movies</button>
        <button onClick={() => onPick('shows')}  aria-pressed={value==='shows'}>Shows</button>
      </div>
    </div>
  );
}
export default MediaType;
