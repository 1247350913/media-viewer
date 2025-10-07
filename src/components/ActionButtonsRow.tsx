import * as Shared from "../../shared";

type Props = Shared.ComponentProps["ActionButtonRow"];

function ActionButtonsRow({ screenName, mediaCard, handleTrailer, handlePlay }: Props ) {
  return (
    <div className={`${screenName.toLowerCase()}__actions--wrap`}>
    <button className="btn btn--ghost" onClick={() => handleTrailer(mediaCard)} disabled={!mediaCard?.sampleFilePath}>
        Trailer
    </button>
    <button className="btn btn--primary" onClick={() => handlePlay(mediaCard)} disabled={!mediaCard?.videoFilePath}>
        ▶ Play
    </button>
    </div>
  )
}

export default ActionButtonsRow;