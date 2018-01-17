import Constants from "../Constants";

export default function changeAudioModePressed(
  internet,
  isLocal,
  audioOuput,
  TrackPlayer,
  currentSec
) {
  let obj = {};
  if (internet || isLocal) {
    if (audioOuput == Constants.AudioModes.LOUDSPEAKER) {
      TrackPlayer.pause();
      TrackPlayer.playWithEarPiece();
      TrackPlayer.seekTo(currentSec);
      obj = { audioOuput: Constants.AudioModes.EARPIECE_SPEAKER };
    } else if (audioOuput == Constants.AudioModes.EARPIECE_SPEAKER) {
      TrackPlayer.pause();
      TrackPlayer.play();
      TrackPlayer.seekTo(currentSec);
      obj = { audioOuput: Constants.AudioModes.LOUDSPEAKER };
    }
  }
  return obj;
}
