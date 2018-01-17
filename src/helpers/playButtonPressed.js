import Constants from "../Constants";
import { Alert } from "react-native";

export default function playButtonPressed(
  internet,
  isLocal,
  TrackPlayer,
  isPlaying,
  audioOuput
) {
  if (internet || isLocal) {
    TrackPlayer.pause();
    isPlaying
      ? null
      : audioOuput === Constants.AudioModes.EARPIECE_SPEAKER
        ? TrackPlayer.playWithEarPiece()
        : TrackPlayer.play();
    return {
      isPlaying: !isPlaying
    };
  } else {
    return { loading: true };
    TrackPlayer.reset();
    Alert.alert("No internet found");
  }
}
