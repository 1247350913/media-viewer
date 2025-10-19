import type { ComponentProps } from "../../types";
import { handleTrailer, handlePlay } from "../../lib";

type Props = ComponentProps["ActionButtonRow"];

function ActionButtonsRow({ screenName, mediaCard, onGo }: Props ) {
  return (
    <div className={`${screenName.toLowerCase()}__actions--wrap`}>
      <button className="btn btn--md btn--ghost" onClick={() => handleTrailer(mediaCard)} disabled={!mediaCard?.sampleFilePath}>
          Trailer
      </button>
      {onGo ? (
      <button className="btn btn--md btn--primary" onClick={onGo}>
          Go
      </button>
      ) :(
      <button className="btn btn--md btn--primary" onClick={() => handlePlay(mediaCard)} disabled={!mediaCard?.videoFilePath}>
          ▶ Play
      </button>
      )}
    </div>
  )
}

export default ActionButtonsRow;