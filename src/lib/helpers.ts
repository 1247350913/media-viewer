import * as Shared from "../../shared"

export async function handleTrailer(mediaCard: Shared.MediaCard) {
    if (mediaCard.sampleFilePath) { 
      await (window as any).api?.play(mediaCard.sampleFilePath);
    } else { 
      console.warn("No sample file path available to play.") 
    };
}

export async function handlePlay(mediaCard: Shared.MediaCard) {
    if (mediaCard.videoFilePath) { 
      await (window as any).api?.play(mediaCard.videoFilePath);
    } else { 
      console.warn("No video file path available to play.") 
    };
}