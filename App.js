/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import EnhancedAudioPlayer from "./src/EnhancedAudioPlayer";
import Seeker from "./src/Seeker";

export default class App extends Component<{}> {
  render() {
    return <EnhancedAudioPlayer />;
  }
}
