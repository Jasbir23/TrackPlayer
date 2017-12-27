import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
  PanResponder,
  NetInfo,
  Platform,
  Animated,
  Alert,
  TouchableWithoutFeedback
} from "react-native";
import { Icon, Thumbnail, Spinner } from "native-base";
import TrackPlayer from "react-native-track-player";
import RNFS from "react-native-fs";
import Seeker from "./Seeker";
import AudioPlayerStyles from "./audioPlayerStyles.js";

const { height, width } = Dimensions.get("window");
let timer = 0;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      songs: [
        {
          name: "Sorry",
          url:
            "https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Comfort_Fit_-_03_-_Sorry.mp3",
          id: 0
        },
        {
          name: "Diljit",
          url:
            "https://downpwnew.com/upload_file/5570/5738/Latest%20Punjabi%20Mp3%20Songs%202017/El%20Sueno%20-%20Diljit%20Dosanjh%20-%20Mp3%20Song/El%20Sueno%20-%20Diljit%20Dosanjh%20190Kbps.mp3",
          id: 2
        },
        {
          name: "PodingBear",
          url:
            "https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Podington_Bear_-_Rubber_Robot.mp3",
          id: 3
        }
      ],
      currentPosition: 0,
      isPlaying: false,
      currentTrack: "Sorry",
      internet: true,
      isLocal: false
    };
  }
  async setNewTrack(track) {
    let downPath = undefined;
    RNFS.exists(
      RNFS.DocumentDirectoryPath + "/" + track.name + ".mp3"
    ).then(async result => {
      if (result === false) {
        // file not found, download it
        this.setState({
          isLocal: false
        });
        let url = track.url;
        let path = RNFS.DocumentDirectoryPath + "/" + track.name + ".mp3";
        if (this.state.internet) {
          RNFS.downloadFile({
            fromUrl: url,
            toFile: path
          }).promise.then(res => {});
          this.setState({
            currentTrack: track.name
          });
          TrackPlayer.add({
            id: "track" + track.id,
            url: track.url,
            title: track.name,
            artist: "Track Artist"
          }).then(async () => {
            await TrackPlayer.skipToNext();
            TrackPlayer.play();
          });
        } else if (!this.state.internet) {
          Alert.alert("Error", "Cannot play network files w/o internet");
        }
      } else {
        // file found, use local path
        this.setState({
          isLocal: true
        });
        downPath =
          "file://" + RNFS.DocumentDirectoryPath + "/" + track.name + ".mp3";
        this.setState({
          currentTrack: track.name
        });
        TrackPlayer.add({
          id: "track" + track.id,
          url: downPath ? downPath : track.url,
          title: track.name,
          artist: "Track Artist"
        }).then(async () => {
          await TrackPlayer.skipToNext();
          TrackPlayer.play();
        });
      }
    });
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
    console.log("createSeekerListener");
    this.setState({
      loading: false
    });
    timer = setInterval(async () => {
      let pos =
        (await TrackPlayer.getPosition()) / (await TrackPlayer.getDuration());
      let sec = await TrackPlayer.getPosition();
      this.setState({
        currentPosition: pos ? pos * width : 0,
        currentSec: sec ? sec : 0
      });
      Seeker.updatePosition(pos ? width - 20 - pos * (width - 20) : width - 20);
    }, 1100);
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
    } else {
      this.setState({
        internet: true,
        loading: false
      });
    }
  }
  componentDidMount() {
    this.createSeekerListener();
    NetInfo.addEventListener(
      "connectionChange",
      this.handleConnectionChange.bind(this)
    );
  }
  componentWillUnmount() {
    this.destroySeekerListener();
  }
  componentWillMount() {
    // Play this to start with
    TrackPlayer.setupPlayer().then(async () => {
      await TrackPlayer.add({
        id: "trackX",
        url:
          "https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Comfort_Fit_-_03_-_Sorry.mp3",
        title: "sorrymp3",
        artist: "Jazzy"
      });
      TrackPlayer.play();
    });
    TrackPlayer.registerEventHandler(async data => {
      let dat = await data;
      console.log(dat);
      if (
        dat.type === "playback-error" &&
        dat.error ===
          "The operation couldn’t be completed. (RNTrackPlayer.AudioPlayerError error 0.)"
      ) {
        RNFS.unlink(
          "file://" +
            RNFS.DocumentDirectoryPath +
            "/" +
            this.state.currentTrack +
            ".mp3"
        ).then(() => {
          Object.keys(this.state.songs).map((item, index) => {
            if (this.state.currentTrack === this.state.songs[item].name) {
              this.setNewTrack(this.state.songs[item]);
            }
          });
        });
      }
      if (dat.type === "playback-queue-ended") {
        TrackPlayer.seekTo(0);
      }
      if (dat.type === "playback-state") {
        if (dat.state === "STATE_BUFFERING" || dat.state === 6) {
          this.setState({
            loading: true,
            isPlaying: false
          });
        }
        if (dat.state === "STATE_PLAYING" || dat.state === 3) {
          this.setState({
            loading: false,
            isPlaying: true
          });
        }
        if (dat.state === "STATE_PAUSED" || dat.state === 2) {
          this.setState({
            loading: false,
            isPlaying: false
          });
        }
      }
    });
  }
  render() {
    let sec = Math.floor(this.state.currentPosition % 60);
    let min = Math.floor(this.state.currentPosition / 60);
    sec < 10 ? (sec = "0" + sec) : (sec = sec);
    min < 10 ? (min = "0" + min) : (min = min);
    return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <View style={AudioPlayerStyles.container}>
          <View style={AudioPlayerStyles.header}>
            <TouchableOpacity style={{ marginLeft: 15 }}>
              <Icon
                name="arrow-back"
                style={{ color: "white", marginTop: 3 }}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flex: 2,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text style={AudioPlayerStyles.headerText}>Les girls</Text>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              alignItems: "center",
              flexDirection: "row"
            }}
          >
            <TouchableOpacity>
              <Text style={{ color: "white", marginRight: 15 }}>Modifier</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 8, backgroundColor: "rgb(39, 83, 94)" }}>
          <View style={AudioPlayerStyles.slab1}>
            <Text style={{ color: "white", marginLeft: 25 }}>
              {this.state.currentTrack}
            </Text>
            <Text style={{ color: "rgb(81, 140, 150)", marginLeft: 10 }}>
              {min + ":" + sec}
            </Text>
            <TouchableOpacity>
              <Icon
                name={"volume-up"}
                style={{
                  color: "white",
                  marginLeft: 10,
                  alignSelf: "center",
                  marginTop: 3
                }}
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
                console.log("Drag end", width - 20 - pos);
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
              onPress={() => {
                if (this.state.internet || this.state.isLocal) {
                  this.state.isPlaying
                    ? TrackPlayer.pause()
                    : TrackPlayer.play();
                  this.setState({
                    isPlaying: !this.state.isPlaying
                  });
                } else {
                  TrackPlayer.pause();
                  Alert.alert("No internet found");
                }
              }}
            >
              {this.renderPlayButton()}
            </TouchableOpacity>
          </View>
          <View style={AudioPlayerStyles.totalSongs}>
            <Text style={{ color: "white" }}>Total Songs : 30</Text>
          </View>
          <View style={{ flex: 3 }}>
            <FlatList
              keyExtractor={(item, index) => index}
              data={this.state.songs}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity onPress={() => this.setNewTrack(item)}>
                    <View style={AudioPlayerStyles.songItem}>
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                          marginLeft: 10
                        }}
                      >
                        <Thumbnail
                          source={{
                            uri:
                              "https://mercantile.wordpress.org/wp-content/uploads/2017/02/wp_whiteonblue.png"
                          }}
                        />
                      </View>
                      <View style={{ flex: 5 }}>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "flex-start",
                            paddingLeft: 5
                          }}
                        >
                          <Text
                            style={{
                              color: "white",
                              marginBottom: 3,
                              fontSize: 15
                            }}
                          >
                            {item.name}
                          </Text>
                          <Text style={{ color: "white", fontSize: 12 }}>
                            +33 6 77 XX 89 65
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
          <View
            style={{
              flex: 1.5,
              flexDirection: "column",
              justifyContent: "flex-start"
            }}
          >
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
