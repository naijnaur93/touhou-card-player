
const relativeRoot = "./../"

function getMusicName(musicFilename) {
  let musicName = musicFilename;
  let albumName = ""
  // album is the string before first "/"
  albumName = musicName.substring(0, musicName.indexOf('/'));
  // get last "/" and last "."
  // and take the between as musicName
  if (musicName !== undefined) {
    let lastSlash = musicName.lastIndexOf('/');
    let lastDot = musicName.lastIndexOf('.');
    musicName = musicName.substring(lastSlash + 1, lastDot);
  }
  // remove author
  let authors = [
    "黄昏フロンティア・上海アリス幻樂団",
    "上海アリス幻樂団",
    "ZUN",
    "あきやまうに",
    "黄昏フロンティア"
  ]
  for (let i = 0; i < authors.length; i++) {
    let author = authors[i];
    if (musicName.startsWith(author + " - ")) {
      musicName = musicName.substring(author.length + 3);
    }
  }
  // if starts with a number + ".", remove it
  if (musicName.match(/^\d+\./)) {
    musicName = musicName.substring(musicName.indexOf('.') + 1);
    // if a space follows, remove it
    if (musicName.startsWith(" ")) {
      musicName = musicName.substring(1);
    }
  }
  return [musicName, albumName];
}

function getMusicFilename(data, character, musicPlayerState) {
  let musicList = data["data"][character]["music"];
  if (typeof musicList === "string") {
    musicList = [musicList];
  }
  let musicId = musicPlayerState.musicIds[character];
  let musicFilename = musicList[musicId];
  return musicFilename;
}

function createWidthResponsiveStyle(small, trans, large) {
  return {
    width: small,
    '@media (min-width: 720px)': {
      width: trans,
    },
    '@media (min-width: 1200px)': {
      width: large,
    },
  }
}

export {
  getMusicName, getMusicFilename, createWidthResponsiveStyle, relativeRoot
}