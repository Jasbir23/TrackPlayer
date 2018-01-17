/* @flow
*/

import { Dimensions } from "react-native";
const { height, width } = Dimensions.get("window");

let styles = {
  container: {
    flex: 1,
    backgroundColor: "rgb(39, 83, 94)",
    flexDirection: "row"
  },
  header: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row"
  },
  headerBackButton: {
    marginLeft: 15
  },
  headerCenterSlab: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center"
  },
  headerRightSlab: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row"
  },
  playerInfoTab: { flex: 8, backgroundColor: "rgb(39, 83, 94)" },
  trackName: { color: "white", marginLeft: 25 },
  secMeter: { color: "rgb(81, 140, 150)", marginLeft: 10 },
  speakerIcon: {
    color: "white",
    marginLeft: 10,
    alignSelf: "center",
    marginTop: 3
  },
  thumbnailSongSlab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10
  },
  songNameSlab: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 5
  },
  footerSlab: {
    flex: 1.5,
    flexDirection: "column",
    justifyContent: "flex-start"
  },
  songNameText: {
    color: "white",
    marginBottom: 3,
    fontSize: 15
  },
  contactNumberText: { color: "white", fontSize: 12 },
  headerText: {
    color: "white",
    fontWeight: "bold"
  },
  slab1: {
    flex: 0.5,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  playButton: {
    height: 50,
    width: 50,
    borderRadius: 25,
    top: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "white"
  },
  totalSongs: {
    flex: 0.5,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 15
  },
  songItem: {
    height: height * 7 / 60,
    width: width,
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  footerText: {
    color: "white",
    fontSize: 12,
    marginTop: 10,
    marginLeft: 15
  },
  footer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "row",
    paddingTop: 15
  },
  footerButton: { marginHorizontal: 20 }
};
export default styles;
