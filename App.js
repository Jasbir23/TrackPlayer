/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import AudioPlayer from "./src/AudioPlayer";
import EnhancedAudioPlayer from "./src/EnhancedAudioPlayer";

// import TrackPlayer from "react-native-track-player";
//
// // Creates the player
// TrackPlayer.setupPlayer().then(async () => {
//   // Adds a track to the queue
//   await TrackPlayer.add({
//     id: "trackId",
//     url:
//       "https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Comfort_Fit_-_03_-_Sorry.mp3",
//     title: "Track Title",
//     artist: "Track Artist"
//   });
//
//   // Starts playing it
//   TrackPlayer.play();
// });

const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
  android:
    "Double tap R on your keyboard to reload,\n" +
    "Shake or press menu button for dev menu"
});

export default class App extends Component<{}> {
  render() {
    return <EnhancedAudioPlayer />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});
