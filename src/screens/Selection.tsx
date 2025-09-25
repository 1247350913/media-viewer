import { useState } from "react";
import type { ScreenProps } from "./";
import Poster from "../components/Poster";

type Props = ScreenProps["Selection"];

function formatHHMMSS(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function pixelQualityToText(pq: number | string): string {
  switch(pq) {
    case 7680: return "8K";
    case 3840: return "4K";
    case 1440: return "2K";
    case 1080: return "1080p";
    case 720:  return "720p";
    case 480:  return "480p";
    default:   return "Unknown";
  }
}

function Selection({ mediaCard, onBack }: Props) {
  const [showMeta, setShowMeta] = useState(false);
  
  async function handlePlay() {
    if (mediaCard.videoFilePath) { 
      await (window as any).api?.play(mediaCard.videoFilePath);
    } else { 
      console.warn("No video file path available to play.") 
    };
  }

  return (
    <div className="sel-wrap">
      <header className="sel-header">
        <button className="btn subtle" onClick={onBack} aria-label="Back">
          ← Back
        </button>
      </header>
      <div className="sel-grid">
        {mediaCard.posterPath ? (
          <Poster path={mediaCard.posterPath} title={mediaCard.title} screenName={"Selection"}/>
        ) : (
          <div className="sel-poster-fallback" aria-hidden />
        )}
        <div className="sel-body">
          <h1 className="sel-title">{mediaCard?.title ?? "Untitled"}</h1>
          <div className="sel-actions">
            <button className="btn ghost" disabled={!mediaCard?.sampleFilePath}>
              Trailer
            </button>
            <button className="btn primary" onClick={handlePlay} disabled={!mediaCard?.videoFilePath}>
              ▶ Play
            </button>
          </div>
          <div className="sel-desc">
            Replace this with the description from the media card for the movie. It will have lots of text like this so it will be super duper long you know and it will be long like this so that there will be lots of text overall.
          </div>
          <div className="sel-meta">
            <button className="btn subtle" onClick={()=>setShowMeta(!showMeta)}>{showMeta ? "Close" : "Meta"}</button>
            {!showMeta ? null : (<div>
              {mediaCard.year && <span>{mediaCard.year}</span>}
              {mediaCard.runtimeSeconds && <span >{formatHHMMSS(mediaCard.runtimeSeconds)}</span>}
              {mediaCard.quality && <span>{pixelQualityToText(mediaCard.quality)}p</span>}
            </div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Selection;