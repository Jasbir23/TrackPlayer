import Constants from "../Constants";
import { Alert } from "react-native";

export default async function setNewTrack(
  track,
  TrackPlayer,
  AudioOutput,
  Internet
) {
  return new Promise(resolve => {
    TrackPlayer.reset();
    if (track.isLocal) {
      TrackPlayer.add({
        id: "track" + track.id,
        url: track.downPath,
        title: track.name,
        artist: "Track Artist"
      }).then(async () => {
        TrackPlayer.play();
        TrackPlayer.pause();
        AudioOutput === Constants.AudioModes.EARPIECE_SPEAKER
          ? TrackPlayer.playWithEarPiece()
          : TrackPlayer.play();
        resolve({
          currentTrack: track.name,
          isLocal: true
        });
      });
    } else if (!track.isLocal) {
      if (Internet) {
        TrackPlayer.add({
          id: "track" + track.id,
          url: track.url,
          title: track.name,
          artist: "Track Artist"
        }).then(async () => {
          TrackPlayer.play();
          TrackPlayer.pause();
          AudioOutput === Constants.AudioModes.EARPIECE_SPEAKER
            ? TrackPlayer.playWithEarPiece()
            : TrackPlayer.play();
        });
        resolve({
          currentTrack: track.name,
          isLocal: false
        });
      } else if (!Internet) {
        resolve({
          isLocal: false,
          currentTrack: undefined
        });
        TrackPlayer.reset();
        Alert.alert("No internet found");
      }
    }
  });
}
