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
