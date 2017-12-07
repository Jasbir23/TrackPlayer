import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
  PanResponder,
  NetInfo
} from "react-native";
import { Icon, Thumbnail, Spinner } from "native-base";
import TrackPlayer from "react-native-track-player";

const { height, width } = Dimensions.get("window");

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lineArray: [
        { height: 8 },
        { height: 15 },
        { height: 12 },
        { height: 20 },
        { height: 22 },
        { height: 10 },
        { height: 12 },
        { height: 15 },
        { height: 9 },
        { height: 29 },
        { height: 9 },
        { height: 18 },
        { height: 12 },
        { height: 16 },
        { height: 6 },
        { height: 5 },
        { height: 9 },
        { height: 22 },
        { height: 13 },
        { height: 12 },
        { height: 15 },
        { height: 18 },
        { height: 20 },
        { height: 14 },
        { height: 30 },
        { height: 27 },
        { height: 30 },
        { height: 12 },
        { height: 15 },
        { height: 25 },
        { height: 22 },
        { height: 20 },
        { height: 25 },
        { height: 24 },
        { height: 16 },
        { height: 18 }
      ],
      songs: [
        {
          name: "Comfort Fit - Sorry",
          url:
            "https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Comfort_Fit_-_03_-_Sorry.mp3",
          id: 0
        },
        {
          name: "Mildred Bailey – All Of Me",
          url:
            "https://ia800304.us.archive.org/34/items/PaulWhitemanwithMildredBailey/PaulWhitemanwithMildredBailey-AllofMe.mp3",
          id: 2
        },
        {
          name: "Popeye - I don't scare",
          url:
            "https://ia800501.us.archive.org/11/items/popeye_i_dont_scare/popeye_i_dont_scare_512kb.mp4",
          id: 3
        }
      ],
      currentMedia: {
        name: "Comfort Fit - Sorry",
        url:
          "https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Comfort_Fit_-_03_-_Sorry.mp3",
        id: 4
      },
      isPlaying: false,
      currentPosition: 0,
      loading: false,
      isMuted: false,
      netCon: "none",
      duration: 1
    };
  }
  componentDidMount() {
    NetInfo.addEventListener("connectionChange", this.handleChange.bind(this));
    console.log(this.state.songs[0]);
    TrackPlayer.setupPlayer().then(async () => {
      await TrackPlayer.add({
        id: "track" + this.state.songs[0].id,
        url: this.state.songs[0].url,
        title: this.state.songs[0].name,
        artist: "Track Artist"
      }).then(() => {
        TrackPlayer.play();
        this.setState({
          isPlaying: true
        });
      });
    });
    TrackPlayer.registerEventHandler(async data => {
      console.log(await data);
    });
    setInterval(async () => {
      this.setState({
        currentPosition: await TrackPlayer.getPosition(),
        duration: await TrackPlayer.getDuration()
      });
    }, 1000);
  }
  componentWillUnmount() {
    NetInfo.removeEventListener(
      "connectionChange",
      this.handleChange.bind(this)
    );
  }
  handleChange(connection) {
    // console.log(connection);
    if (connection.type === "wifi") {
      this.setState({
        netCon: "wifi"
      });
    } else if (connection.type === "cellular") {
      this.setState({
        netCon: "cellular"
      });
    } else {
      this.setState({
        netCon: "none"
      });
    }
  }
  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (e, gestureState) => {
        const { dx, dy } = gestureState;

        return Math.abs(dx) > 1 || Math.abs(dy) > 1;
      },
      onPanResponderRelease: (dx, dy) => {
        // console.log(dy);
        if (this.state.duration) {
          this.setState({
            currentPosition: dy.x0 / width * this.state.duration
          });
          TrackPlayer.seekTo(dy.x0 / width * this.state.duration);
        }
        return null;
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
  async addNewTrack(item) {
    console.log(item);
    await TrackPlayer.add({
      id: "track" + item.id,
      url: item.url,
      title: item.name,
      artist: "Track Artist"
    }).then(() => {
      TrackPlayer.skipToNext();
    });
  }
  render() {
    let min = Math.round(this.state.currentPosition / 60);
    let sec = Math.round(this.state.currentPosition % 60);
    // console.log(TrackPlayer.ProgressComponent);
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
            <Text style={{ color: "white", marginLeft: 25 }}>MistyPeople</Text>
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
              {...this._panResponder.panHandlers}
            >
              {this.state.lineArray.map((item, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      height: item.height,
                      marginHorizontal: 3,
                      width: 2,
                      backgroundColor: "white"
                    }}
                  />
                );
              })}
              <View
                style={{
                  height: 50,
                  left: 10,
                  width: 3,
                  position: "absolute",
                  top: 10,
                  left:
                    width * (this.state.currentPosition / this.state.duration)
                }}
              >
                <View
                  style={{
                    height: 40,
                    width: 3,
                    backgroundColor: "rgb(81, 140, 150)"
                  }}
                />
                <View
                  style={{
                    height: 10,
                    width: 10,
                    borderRadius: 5,
                    backgroundColor: "rgb(81, 140, 150)",
                    alignSelf: "center"
                  }}
                />
              </View>
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
                  onPress={async () => {
                    this.state.isPlaying
                      ? await TrackPlayer.pause()
                      : await TrackPlayer.play();
                    this.setState({
                      isPlaying: !this.state.isPlaying
                    });
                  }}
                >
                  {this.renderPlayButton()}
                </TouchableOpacity>
              </View>
            </View>
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
                  <TouchableOpacity onPress={() => this.addNewTrack(item)}>
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
                              "https://upload.wikimedia.org/wikipedia/commons/5/57/Nxt-logo-round-blue-transparent.png"
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
              <TouchableOpacity style={{ marginHorizontal: 20 }}>
                <Icon
                  name={
                    this.state.netCon === "wifi"
                      ? "wifi"
                      : this.state.netCon === "cellular"
                        ? "phone-portrait"
                        : "close"
                  }
                  active
                  style={{ color: "black" }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }
}
