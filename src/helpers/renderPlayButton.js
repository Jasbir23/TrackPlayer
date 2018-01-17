import React from "react";
import { Spinner, Icon } from "native-base";

export default function getPlayButton(loading, isPlaying) {
  if (loading) {
    return <Spinner color="white" />;
  }
  return (
    <Icon
      active
      name={isPlaying ? "pause" : "play"}
      style={{
        color: "white",
        marginTop: 3,
        fontSize: 30
      }}
    />
  );
}
