import React from "react";
import { Component } from "react";
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
import checkForLocalFiles from "./helpers/checkLocalFiles";
import downloadFile from "./helpers/downloadFile";
import setNewTrack from "./helpers/setNewTrack";
import handleConnectionChange from "./helpers/handleConnectionChange";
import handleEvents from "./helpers/handleEvents";
import changeAudioModePressed from "./helpers/changeAudioModePressed";
import playButtonPressed from "./helpers/playButtonPressed";
import getPlayButton from "./helpers/renderPlayButton";
import Constants from "./Constants";
const { RNReactNativeProximityWakeLock: AndroidWakeLock } = NativeModules;
import { Icon, Thumbnail } from "native-base";
import TrackPlayer from "react-native-track-player";
import RNFS from "react-native-fs";
import Seeker from "./Seeker";
import AudioPlayerStyles from "./audioPlayerStyles.js";
import Proximity from "react-native-proximity";
const self = undefined;
let isUnmounted = false;
const { height, width } = Dimensions.get("window");
let timer = 0;

export default class EnhancedAudioPlayer extends Component<{}> {
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
    this._proximityListener = this._proximityListener.bind(this);
    this.changeAudioModePressed = this.changeAudioModePressed.bind(this);
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
    isUnmounted = false;
    this.createSeekerListener();
    AppState.addEventListener("change", this._handleAppStateChange);
    NetInfo.addEventListener(
      "connectionChange",
      this.handleConnectionChange.bind(this)
    );
    Proximity.addListener(this._proximityListener);
    this.setState({
      songs: checkForLocalFiles(this.state.songs)
    });
  }

  componentWillUnmount() {
    isUnmounted = true;
    this.destroySeekerListener();
    NetInfo.removeEventListener(
      "connectionChange",
      this.handleConnectionChange.bind(this)
    );
    Proximity.removeListener(this._proximityListener);
    AppState.removeEventListener("change", this._handleAppStateChange);
  }
  async downloadFile(track) {
    if ((await downloadFile(track)) && !isUnmounted) {
      this.setState({
        songs: checkForLocalFiles(this.state.songs)
      });
    }
  }

  async setNewTrack(track) {
    let res = await setNewTrack(
      track,
      TrackPlayer,
      this.state.audioOuput,
      this.state.internet
    );
    this.setState({
      currentTrack: res.currentTrack,
      isLocal: res.isLocal
    });
    if (res.currentTrack !== undefined && res.isLocal === false) {
      this.downloadFile(track);
    }
  }

  renderPlayButton() {
    return getPlayButton(this.state.loading, this.state.isPlaying);
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
    this.setState(
      handleConnectionChange(connection, this.state.isLocal, TrackPlayer)
    );
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
  };

  _proximityListener(data) {
    if (data) {
      if (data.proximity) {
        AndroidWakeLock ? AndroidWakeLock.activate() : null;
      } else if (!data.proximity) {
        AndroidWakeLock ? AndroidWakeLock.deactivate() : null;
      }
      this.setState({ proximity: data.proximity });
      if (this.state.internet || this.state.isLocal) {
        TrackPlayer.pause();
        if (this.state.proximity && this.state.isPlaying) {
          TrackPlayer.playWithEarPiece();
          TrackPlayer.seekTo(this.state.currentSec);
          this.setState({ audioOuput: Constants.AudioModes.EARPIECE_SPEAKER });
        } else if (!this.state.proximity && this.state.isPlaying) {
          TrackPlayer.play();
          TrackPlayer.seekTo(this.state.currentSec);
          this.setState({ audioOuput: Constants.AudioModes.LOUDSPEAKER });
        }
      }
    }
  }

  changeAudioModePressed() {
    this.setState(
      changeAudioModePressed(
        this.state.internet,
        this.state.isLocal,
        this.state.audioOuput,
        TrackPlayer,
        this.state.currentSec
      )
    );
  }
  static async handleEvents(dat) {
    if (!isUnmounted && dat.type !== "playback-unbind") {
      handleEvents(dat, self, TrackPlayer, checkForLocalFiles);
    }
  }
  playButtonPressed() {
    this.setState(
      playButtonPressed(
        this.state.internet,
        this.state.isLocal,
        TrackPlayer,
        this.state.isPlaying,
        this.state.audioOuput
      )
    );
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
              onPress={() => this.changeAudioModePressed()}
              disabled={
                this.state.audioOuput == Constants.AudioModes.HEADSET ||
                this.state.currentTrack === undefined
              }
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
              enabled={
                (this.state.internet || this.state.isLocal) &&
                this.state.currentTrack !== undefined
              }
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
