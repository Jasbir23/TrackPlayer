import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
  NetInfo,
  Platform,
  Animated,
  Alert,
  AppState,
  AppRegistry,
  NativeModules
} from "react-native";
import Constants from "./Constants";
const { RNReactNativeProximityWakeLock: AndroidWakeLock } = NativeModules;
import { Icon, Thumbnail, Spinner } from "native-base";
import TrackPlayer from "react-native-track-player";
import RNFS from "react-native-fs";
import Seeker from "./Seeker";
import AudioPlayerStyles from "./audioPlayerStyles.js";
import Proximity from "react-native-proximity";
let self = undefined;
const { height, width } = Dimensions.get("window");
let timer = 0;

export default class EnhancedAudioPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      songs: Constants.defaultPlaylist,
      currentPosition: 0,
      isPlaying: false,
      currentTrack: undefined,
      internet: true,
      isLocal: false,
      proximity: false,
      currentSec: 0,
      appState: AppState.currentState,
      audioOuput: Constants.AudioModes.LOUDSPEAKER
    };
    self = this;
    this._onChangeAudioOutput = this._onChangeAudioOutput.bind(this);
    this._proximityListener = this._proximityListener.bind(this);
    this._onVolumeIconPressed = this._onVolumeIconPressed.bind(this);
  }

  componentDidMount() {
    TrackPlayer.setupPlayer().then(async () => {});
    TrackPlayer.updateOptions({
      capabilities: [TrackPlayer.CAPABILITY_PLAY, TrackPlayer.CAPABILITY_PAUSE],
      compactCapabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE
      ],
      stopWithApp: true
    });
  }

  componentWillMount() {
    this.createSeekerListener();
    AppState.addEventListener("change", this._handleAppStateChange);
    NetInfo.addEventListener(
      "connectionChange",
      this.handleConnectionChange.bind(this)
    );
    Proximity.addListener(this._proximityListener);
    this.checkForLocalFiles(this.state.songs);
  }

  componentWillUnmount() {
    this.destroySeekerListener();
    TrackPlayer.destroy();
    NetInfo.removeEventListener(
      "connectionChange",
      this.handleConnectionChange.bind(this)
    );
    Proximity.removeListener(this._proximityListener);
    AppState.removeEventListener("change", this._handleAppStateChange);
  }
  checkForLocalFiles(playListArray) {
    playListArray.map((item, index) => {
      RNFS.exists(
        RNFS.DocumentDirectoryPath + "/" + item.name + ".mp3"
      ).then(result => {
        if (!result) {
          playListArray[index].isLocal = undefined;
          playListArray[index].downPath = undefined;
        }
        if (result === true) {
          playListArray[index].isLocal = true;
          playListArray[index].downPath =
            "file://" + RNFS.DocumentDirectoryPath + "/" + item.name + ".mp3";
        }
      });
    });
  }
  downloadFile(track) {
    RNFS.downloadFile({
      fromUrl: track.url,
      toFile: RNFS.DocumentDirectoryPath + "/" + track.name + ".mp3"
    }).promise.then(res => {
      if (res) {
        this.checkForLocalFiles(this.state.songs);
      }
    });
  }

  async setNewTrack(track) {
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
        this.state.audioOuput === Constants.AudioModes.EARPIECE_SPEAKER
          ? TrackPlayer.playWithEarPiece()
          : TrackPlayer.play();
        this.setState({
          currentTrack: track.name,
          isLocal: true
        });
      });
    } else if (!track.isLocal) {
      if (this.state.internet) {
        this.downloadFile(track);
        TrackPlayer.add({
          id: "track" + track.id,
          url: track.url,
          title: track.name,
          artist: "Track Artist"
        }).then(async () => {
          TrackPlayer.play();
          TrackPlayer.pause();
          this.state.audioOuput === Constants.AudioModes.EARPIECE_SPEAKER
            ? TrackPlayer.playWithEarPiece()
            : TrackPlayer.play();
        });
        this.setState({
          currentTrack: track.name,
          isLocal: false
        });
      } else if (!this.state.internet) {
        this.setState({
          isLocal: false
        });
        TrackPlayer.reset();
        Alert.alert("No internet found");
      }
    }
  }

  renderPlayButton() {
    if (this.state.loading) {
      return <Spinner color="white" />;
    }
    return (
      <Icon
        active
        name={this.state.isPlaying ? "pause" : "play"}
        style={{
          color: "white",
          marginTop: 3,
          fontSize: 30
        }}
      />
    );
  }

  createSeekerListener() {
    this.setState({
      loading: false
    });
    timer = setInterval(async () => {
      let pos =
        (await TrackPlayer.getPosition()) / (await TrackPlayer.getDuration());
      let sec = await TrackPlayer.getPosition();

      if (!isFinite(pos) || sec < 0 || pos < 0) {
        pos = 0;
        sec = 0;
      }

      this.setState({
        currentPosition: pos ? pos * width : 0,
        currentSec: sec ? sec : 0
      });
      Seeker.updatePosition(pos ? width - 20 - pos * (width - 20) : width - 20);
    }, 1000);
  }

  destroySeekerListener() {
    this.setState({
      loading: true
    });
    clearInterval(timer);
  }

  handleConnectionChange(connection) {
    if (connection.type === "none" || connection.type === "unknown") {
      this.setState({
        internet: false
      });
      if (!this.state.isLocal) {
        TrackPlayer ? TrackPlayer.reset() : null;
        Alert.alert("No internet found");
      }
    } else {
      this.setState({
        internet: true,
        loading: false
      });
    }
  }

  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active" &&
      !(this.state.audioOuput == Constants.AudioModes.HEADSET)
    ) {
      Proximity.addListener(this._proximityListener);
    } else if (nextAppState === "background") {
      Proximity.removeListener(this._proximityListener);
    }
    this.setState({ appState: nextAppState });
  };

  _onChangeAudioOutput() {
    TrackPlayer.pause();
    if (this.state.internet || this.state.isLocal) {
      if (this.state.proximity && this.state.isPlaying) {
        TrackPlayer.playWithEarPiece();
        this.setState({ audioOuput: Constants.AudioModes.EARPIECE_SPEAKER });
      } else if (!this.state.proximity && this.state.isPlaying) {
        TrackPlayer.play();
        this.setState({ audioOuput: Constants.AudioModes.LOUDSPEAKER });
      }
      TrackPlayer.seekTo(this.state.currentSec);
    }
  }

  _proximityListener(data) {
    if (data) {
      if (data.proximity) {
        AndroidWakeLock ? AndroidWakeLock.activate() : null;
      } else if (!data.proximity) {
        AndroidWakeLock ? AndroidWakeLock.deactivate() : null;
      }
      this.setState({ proximity: data.proximity });
      this._onChangeAudioOutput();
    }
  }

  _onVolumeIconPressed() {
    if (this.state.internet || this.state.isLocal) {
      if (this.state.audioOuput == Constants.AudioModes.LOUDSPEAKER) {
        TrackPlayer.pause();
        TrackPlayer.playWithEarPiece();
        this.setState({ audioOuput: Constants.AudioModes.EARPIECE_SPEAKER });
        TrackPlayer.seekTo(this.state.currentSec);
      } else if (
        this.state.audioOuput == Constants.AudioModes.EARPIECE_SPEAKER
      ) {
        TrackPlayer.pause();
        TrackPlayer.play();
        this.setState({ audioOuput: Constants.AudioModes.LOUDSPEAKER });
        TrackPlayer.seekTo(this.state.currentSec);
      }
    }
  }
  static handleEvents(dat) {
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
        this.checkForLocalFiles(this.state.songs);
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
  playButtonPressed() {
    if (this.state.internet || this.state.isLocal) {
      TrackPlayer.pause();
      this.state.isPlaying
        ? null
        : this.state.audioOuput === Constants.AudioModes.EARPIECE_SPEAKER
          ? TrackPlayer.playWithEarPiece()
          : TrackPlayer.play();
      this.setState({
        isPlaying: !this.state.isPlaying
      });
    } else {
      TrackPlayer.reset();
      Alert.alert("No internet found");
    }
  }

  render() {
    let sec = Math.floor(this.state.currentSec % 60);
    let min = Math.floor(this.state.currentSec / 60);
    sec < 10 ? (sec = "0" + sec) : (sec = sec);
    min < 10 ? (min = "0" + min) : (min = min);
    return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <View style={AudioPlayerStyles.container}>
          <View style={AudioPlayerStyles.header}>
            <TouchableOpacity style={AudioPlayerStyles.headerBackButton}>
              <Icon
                name="arrow-back"
                style={{ color: "white", marginTop: 3 }}
              />
            </TouchableOpacity>
          </View>
          <View style={AudioPlayerStyles.headerCenterSlab}>
            <Text style={AudioPlayerStyles.headerText}>Les girls</Text>
          </View>
          <View style={AudioPlayerStyles.headerRightSlab}>
            <TouchableOpacity>
              <Text style={{ color: "white", marginRight: 15 }}>Modifier</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={AudioPlayerStyles.playerInfoTab}>
          <View style={AudioPlayerStyles.slab1}>
            <Text style={AudioPlayerStyles.trackName}>
              {this.state.currentTrack ? this.state.currentTrack : "----"}
            </Text>
            <Text style={AudioPlayerStyles.secMeter}>{min + ":" + sec}</Text>
            <TouchableOpacity
              onPress={() => this._onVolumeIconPressed()}
              disabled={this.state.audioOuput == Constants.AudioModes.HEADSET}
            >
              <Icon
                name={
                  this.state.audioOuput == Constants.AudioModes.LOUDSPEAKER
                    ? "volume-up"
                    : this.state.audioOuput == Constants.AudioModes.HEADSET
                      ? "ios-headset"
                      : "volume-down"
                }
                style={AudioPlayerStyles.speakerIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 2 }}>
            <Seeker
              enabled={this.state.internet || this.state.isLocal}
              touchSeek={async pos => {
                let diff = width - 20 - pos;
                let sec =
                  (width - 20 - pos) /
                  (width - 20) *
                  (await TrackPlayer.getDuration());
                TrackPlayer.seekTo(sec);
              }}
              beginDrag={pos => {
                this.destroySeekerListener();
              }}
              endDrag={async pos => {
                let diff = width - 20 - pos;
                let sec =
                  (width - 20 - pos) /
                  (width - 20) *
                  (await TrackPlayer.getDuration());
                TrackPlayer.seekTo(sec);
                this.createSeekerListener();
              }}
            />
            <TouchableOpacity
              style={AudioPlayerStyles.playButton}
              disabled={
                this.state.loading || this.state.currentTrack === undefined
              }
              onPress={() => {
                this.playButtonPressed();
              }}
            >
              {this.renderPlayButton()}
            </TouchableOpacity>
          </View>
          <View style={AudioPlayerStyles.totalSongs}>
            <Text style={{ color: "white" }}>
              {"Total Songs : " + this.state.songs.length}
            </Text>
          </View>
          <View style={{ flex: 3 }}>
            <FlatList
              keyExtractor={(item, index) => index}
              data={this.state.songs}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity onPress={() => this.setNewTrack(item)}>
                    <View style={AudioPlayerStyles.songItem}>
                      <View style={AudioPlayerStyles.thumbnailSongSlab}>
                        <Thumbnail
                          source={{
                            uri:
                              "https://mercantile.wordpress.org/wp-content/uploads/2017/02/wp_whiteonblue.png"
                          }}
                        />
                      </View>
                      <View style={{ flex: 5 }}>
                        <View style={AudioPlayerStyles.songNameSlab}>
                          <Text style={AudioPlayerStyles.songNameText}>
                            {item.name}
                          </Text>
                          <Text style={AudioPlayerStyles.contactNumberText}>
                            {item.contactNumber}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
          <View style={AudioPlayerStyles.footerSlab}>
            <Text style={AudioPlayerStyles.footerText}>
              Reception des messages vocaux via:
            </Text>
            <View style={AudioPlayerStyles.footer}>
              <TouchableOpacity style={AudioPlayerStyles.footerButton}>
                <Icon name="mail" style={{ color: "white" }} />
              </TouchableOpacity>
              <TouchableOpacity style={AudioPlayerStyles.footerButton}>
                <Icon name="chatboxes" active style={{ color: "white" }} />
              </TouchableOpacity>
              <TouchableOpacity style={AudioPlayerStyles.footerButton}>
                <Icon name="quote" active style={{ color: "white" }} />
              </TouchableOpacity>
              <TouchableOpacity style={AudioPlayerStyles.footerButton}>
                <Icon
                  name="wifi"
                  active
                  style={{ color: this.state.internet ? "white" : "red" }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

AppRegistry.registerComponent("EnhancedAudioPlayer", () => EnhancedAudioPlayer);
TrackPlayer.registerEventHandler(async data => {
  let dat = await data;
  EnhancedAudioPlayer.handleEvents(dat);
});
