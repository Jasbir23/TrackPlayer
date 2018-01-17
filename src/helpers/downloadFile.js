import RNFS from "react-native-fs";

export default function downloadFile(track) {
  return new Promise(resolve => {
    RNFS.downloadFile({
      fromUrl: track.url,
      toFile: RNFS.DocumentDirectoryPath + "/" + track.name + ".mp3"
    }).promise.then(res => {
      if (res) {
        resolve(true);
      } else if (!res) {
        resolve(false);
      }
    });
  });
}
