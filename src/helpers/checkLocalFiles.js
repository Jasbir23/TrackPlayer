import RNFS from "react-native-fs";

export default function checkForLocalFiles(playListArray) {
  playListArray.map((item, index) => {
    RNFS.exists(
      RNFS.DocumentDirectoryPath + "/" + item.name + ".mp3"
    ).then(result => {
      if (!result) {
        playListArray[index].isLocal = undefined;
        playListArray[index].downPath = undefined;
      }
      if (result === true) {
        playListArray[index].isLocal = true;
        playListArray[index].downPath =
          "file://" + RNFS.DocumentDirectoryPath + "/" + item.name + ".mp3";
      }
    });
  });
  return playListArray;
}
