export default (Constants = {
  AudioModes: {
    LOUDSPEAKER: "loudspeaker",
    EARPIECE_SPEAKER: "earpiece_speaker",
    HEADSET: "headset"
  },
  defaultPlaylist: [
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
  playbackEvents: {
    REMOTE_PAUSE: "remote-pause",
    REMOTE_PLAY: "remote-play",
    PLAYBACK_ERROR: "playback-error",
    CORRUPT_FILE_ERROR:
      "The operation couldn’t be completed. (RNTrackPlayer.AudioPlayerError error 0.)",
    PLAYBACK_QUEUE_ENDED: "playback-queue-ended",
    HEADSET_IN: "headset-plugged-in",
    HEADSET_OUT: "headset-plugged-out",
    STATE_BUFFERING: "STATE_BUFFERING",
    PLAYBACK_STATE: "playback-state",
    STATE_PLAYING: "STATE_PLAYING",
    STATE_PAUSED: "STATE_PAUSED"
  }
});
