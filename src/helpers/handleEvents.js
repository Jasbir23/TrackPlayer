import Constants from "../Constants";

export default function handleEvents(
  dat,
  self,
  TrackPlayer,
  checkForLocalFiles
) {
  if (dat.type === Constants.playbackEvents.REMOTE_PAUSE) {
    self.playButtonPressed();
  }
  if (dat.type === Constants.playbackEvents.REMOTE_PLAY) {
    self.playButtonPressed();
  }
  if (
    dat.type === Constants.playbackEvents.PLAYBACK_ERROR &&
    dat.error === Constants.playbackEvents.CORRUPT_FILE_ERROR
  ) {
    RNFS.unlink(
      "file://" +
        RNFS.DocumentDirectoryPath +
        "/" +
        self.state.currentTrack +
        ".mp3"
    ).then(() => {
      self.setState({
        songs: checkForLocalFiles(self.state.songs)
      });
      TrackPlayer.reset();
      Alert.alert(
        "Corrupted Local file found and deleted, Player has been reset"
      );
    });
  }
  if (dat.type === Constants.playbackEvents.PLAYBACK_QUEUE_ENDED) {
    TrackPlayer.seekTo(0);
  }
  if (dat.type === Constants.playbackEvents.HEADSET_IN) {
    if (Platform.OS != "ios") TrackPlayer.play();
    self.setState({ audioOuput: Constants.AudioModes.HEADSET });
    Proximity.removeListener(self._proximityListener);
  }
  if (dat.type === Constants.playbackEvents.HEADSET_OUT) {
    self.setState({ audioOuput: Constants.AudioModes.LOUDSPEAKER });
    Proximity.addListener(self._proximityListener);
  }
  if (dat.type === Constants.playbackEvents.PLAYBACK_STATE) {
    if (
      dat.state === Constants.playbackEvents.STATE_BUFFERING ||
      dat.state === 6
    ) {
      self.setState({
        loading: true,
        isPlaying: false
      });
    }
    if (
      dat.state === Constants.playbackEvents.STATE_PLAYING ||
      dat.state === 3
    ) {
      self.setState({
        loading: false,
        isPlaying: true
      });
    }
    if (
      dat.state === Constants.playbackEvents.STATE_PAUSED ||
      dat.state === 2
    ) {
      self.setState({
        loading: false,
        isPlaying: false
      });
    }
  }
}
