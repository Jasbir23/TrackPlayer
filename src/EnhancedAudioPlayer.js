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
  Animated
} from "react-native";
import { Icon, Thumbnail, Spinner } from "native-base";
import TrackPlayer from "react-native-track-player";
import RNFS from "react-native-fs";

const { height, width } = Dimensions.get("window");

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lineArray: [
        12,
        18,
        19,
        20,
        22,
        23,
        17,
        14,
        15,
        17,
        21,
        24,
        26,
        28,
        20,
        21,
        23,
        25,
        27,
        29,
        22,
        21,
        20,
        22,
        24,
        16,
        18,
        20,
        19,
        16,
        18,
        15,
        19
      ],
      loading: false,
      songs: [
        {
          name: "Sorry",
          url:
            "https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Comfort_Fit_-_03_-_Sorry.mp3",
          id: 0
        },
        {
          name: "AllOfMe",
          url:
            "https://ia800304.us.archive.org/34/items/PaulWhitemanwithMildredBailey/PaulWhitemanwithMildredBailey-AllofMe.mp3",
          id: 2
        },
        {
          name: "Popeye",
          url:
            "https://ia800501.us.archive.org/11/items/popeye_i_dont_scare/popeye_i_dont_scare_512kb.mp4",
          id: 3
        },
        {
          name: "PodingBear",
          url:
            "https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Podington_Bear_-_Rubber_Robot.mp3",
          id: 4
        }
      ],
      currentPosition: 0,
      isPlaying: false,
      currentTrack: "AllOfMe",
      internet: true
    };
  }
  async setNewTrack(track) {
    let downPath = undefined;
    RNFS.exists(
      RNFS.DocumentDirectoryPath + "/" + track.name + ".mp3"
    ).then(result => {
      if (result === false) {
        // file not found, download it
        let url = track.url;
        let path = RNFS.DocumentDirectoryPath + "/" + track.name + ".mp3";
        RNFS.downloadFile({
          fromUrl: url,
          toFile: path
        }).promise.then(res => {});
      } else {
        // file found, use local path
        downPath =
          "file://" + RNFS.DocumentDirectoryPath + "/" + track.name + ".mp3";
      }
    });
    await TrackPlayer.add({
      id: "track" + track.id,
      url: downPath ? downPath : track.url,
      title: track.name,
      artist: "Track Artist"
    }).then(async () => {
      await TrackPlayer.skipToNext();
      this.setState({
        currentTrack: track.name
      });
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
    this.seeker = setInterval(async () => {
      let pos =
        (await TrackPlayer.getPosition()) / (await TrackPlayer.getDuration());
      this.refs.seeker._component.scrollTo({
        x: pos ? width - 20 - pos * (width - 20) : width - 20
      });
      this.setState({
        currentPosition: pos ? pos * width : 0,
        currentSec: await TrackPlayer.getPosition()
      });
    }, 500);
  }
  destroySeekerListener() {
    this.seeker ? clearInterval(this.seeker) : null;
  }
  handleConnectionChange(connection) {
    if (connection.type === "none" || connection.type === "unknown") {
      this.setState({
        internet: false
      });
      TrackPlayer ? TrackPlayer.stop() : null;
    } else {
      this.setState({
        internet: true
      });
    }
  }
  componentDidMount() {
    this.createSeekerListener();
    NetInfo.addEventListener(
      "connectionChange",
      this.handleConnectionChange.bind(this)
    );
    this.refs.seeker._component.scrollTo({
      x: width - 20,
      animated: false
    });
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
          "https://ia800304.us.archive.org/34/items/PaulWhitemanwithMildredBailey/PaulWhitemanwithMildredBailey-AllofMe.mp3",
        title: "sorrymp3",
        artist: "Jazzy"
      }).then(async () => {
        await TrackPlayer.play();
      });
    });
    TrackPlayer.registerEventHandler(async data => {
      let dat = await data;
      if (dat.type === "playback-queue-ended") {
        TrackPlayer.seekTo(0);
      }
      if (dat.type === "playback-state") {
        if (dat.state === "STATE_BUFFERING") {
          this.setState({
            loading: true,
            isPlaying: false
          });
        }
        if (dat.state === "STATE_PLAYING") {
          this.setState({
            loading: false,
            isPlaying: true
          });
        }
        if (dat.state === "STATE_PAUSED") {
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
        <View
          style={{
            flex: 1,
            backgroundColor: "rgb(39, 83, 94)",
            flexDirection: "row"
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "center",
              flexDirection: "row"
            }}
          >
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
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Les girls
            </Text>
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
          <View
            style={{
              flex: 0.5,
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center"
            }}
          >
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
            <View
              style={{
                flex: 1.5,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              {this.state.lineArray.map((item, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      height: item,
                      marginHorizontal: 3,
                      width: 2,
                      backgroundColor: "white"
                    }}
                  />
                );
              })}
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: "flex-start",
                alignItems: "center"
              }}
            >
              <View
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: "white",
                  backgroundColor: "rgba(255,255,255,0.2)"
                }}
              >
                <TouchableOpacity
                  disabled={!this.state.internet}
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                  onPress={() => {
                    this.state.isPlaying
                      ? TrackPlayer.pause()
                      : TrackPlayer.play();
                    this.setState({
                      isPlaying: !this.state.isPlaying
                    });
                  }}
                >
                  {this.renderPlayButton()}
                </TouchableOpacity>
              </View>
            </View>
            <Animated.ScrollView
              style={{
                position: "absolute",
                top: 0,
                left: 0
              }}
              bounces={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              ref="seeker"
              contentContainerStyle={{
                height: 16 * height / 112.5,
                width: (width - 10) * 2
              }}
              scrollEnabled={this.state.internet}
              onScrollBeginDrag={e => {
                this.destroySeekerListener();
              }}
              onScrollEndDrag={async e => {
                let pos = width - 20 - e.nativeEvent.contentOffset.x;
                let sec =
                  pos / (width - 20) * (await TrackPlayer.getDuration());
                await TrackPlayer.seekTo(sec);
                this.createSeekerListener();
              }}
            >
              <View
                style={{
                  height: 40,
                  width: 4,
                  top: 10,
                  left: width - 10,
                  backgroundColor: "green"
                }}
              />
            </Animated.ScrollView>
          </View>
          <View
            style={{
              flex: 0.5,
              justifyContent: "flex-start",
              alignItems: "center",
              flexDirection: "row",
              paddingLeft: 15
            }}
          >
            <Text style={{ color: "white" }}>Total Songs : 30</Text>
          </View>
          <View style={{ flex: 3 }}>
            <FlatList
              keyExtractor={(item, index) => index}
              data={this.state.songs}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    disabled={!this.state.internet}
                    onPress={() => this.setNewTrack(item)}
                  >
                    <View
                      style={{
                        height: height * 7 / 60,
                        width: width,
                        flexDirection: "row",
                        justifyContent: "flex-start"
                      }}
                    >
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
            <Text
              style={{
                color: "white",
                fontSize: 12,
                marginTop: 10,
                marginLeft: 15
              }}
            >
              Reception des messages vocaux via:
            </Text>
            <View
              style={{
                flex: 1,
                justifyContent: "flex-start",
                alignItems: "flex-start",
                flexDirection: "row",
                paddingTop: 15
              }}
            >
              <TouchableOpacity style={{ marginHorizontal: 20 }}>
                <Icon name="mail" style={{ color: "white" }} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginHorizontal: 20 }}>
                <Icon name="chatboxes" active style={{ color: "white" }} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginHorizontal: 20 }}>
                <Icon name="quote" active style={{ color: "white" }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
            width: width,
            height: 100,
            backgroundColor: "yellow",
            top: this.state.internet ? height : height - 150
          }}
        >
          <Text>No internet</Text>
        </View>
      </View>
    );
  }
}
