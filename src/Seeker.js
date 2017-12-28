import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated
} from "react-native";

const { height, width } = Dimensions.get("window");
let seeker = undefined;

export default class Seeker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lineArray: []
    };
  }
  componentDidMount() {
    seeker = this.refs.seeker._component;
    this.refs.seeker._component.scrollTo({
      x: width - 20,
      animated: false
    });
  }
  componentWillMount() {
    let i = 0;
    let arr = [];
    while (i < width) {
      arr.push(50 * Math.random());
      i += 8;
    }
    this.setState({
      lineArray: arr
    });
  }
  static updatePosition(pos) {
    if(isFinite(pos))
    seeker.scrollTo({
      x: pos,
      animated: false
    });
  }
  render() {
    return (
      <View
        style={{
          height: 16 * height / 112.5,
          width: width,
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
        <Animated.ScrollView
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: width,
            height: 16 * height / 112.5
          }}
          scrollEnabled={this.props.enabled}
          decelerationRate={"fast"}
          horizontal={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          ref="seeker"
          onScrollBeginDrag={e => {
            this.props.beginDrag(e.nativeEvent.contentOffset.x);
          }}
          onScrollEndDrag={e => {
            this.props.endDrag(e.nativeEvent.contentOffset.x);
          }}
          contentContainerStyle={{
            width: (width - 10) * 2,
            height: 16 * height / 112.5,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <TouchableOpacity
            disabled={!this.props.enabled}
            style={{
              height: 16 * height / 112.5,
              width: (width - 10) * 2
            }}
            onPress={e => {
              let diff = e.nativeEvent.pageX;
              this.props.touchSeek(width - 20 - diff);
            }}
            activeOpacity={1}
          >
            <View
              style={{
                height: 50,
                width: 4,
                left: width - 10,
                backgroundColor: "green",
                top: 10
              }}
            />
          </TouchableOpacity>
        </Animated.ScrollView>
      </View>
    );
  }
}
