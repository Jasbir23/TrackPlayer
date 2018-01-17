import { Alert } from "react-native";

export default function handleConnectionChange(
  connection,
  isLocal,
  TrackPlayer
) {
  if (connection.type === "none" || connection.type === "unknown") {
    return {
      internet: false,
      currentTrack: undefined
    };
    if (!isLocal) {
      TrackPlayer ? TrackPlayer.reset() : null;
      Alert.alert("No internet found");
    }
  } else {
    return {
      internet: true,
      loading: false
    };
  }
}
