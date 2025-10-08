import * as Shared from "../../shared";
import * as lib from "../lib";

type Props = Shared.ComponentProps["ActionButtonRow"];

function ActionButtonsRow({ screenName, mediaCard, onGo }: Props ) {
  return (
    <div className={`${screenName.toLowerCase()}__actions--wrap`}>
      <button className="btn btn--md btn--ghost" onClick={() => lib.handleTrailer(mediaCard)} disabled={!mediaCard?.sampleFilePath}>
          Trailer
      </button>
      {onGo ? (
      <button className="btn btn--md btn--primary" onClick={onGo}>
          Go
      </button>
      ) :(
      <button className="btn btn--md btn--primary" onClick={() => lib.handlePlay(mediaCard)} disabled={!mediaCard?.videoFilePath}>
          ▶ Play
      </button>
      )}
    </div>
  )
}

export default ActionButtonsRow;