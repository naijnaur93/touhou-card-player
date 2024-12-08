import { List, ListItem } from "@mui/material";
import { useTheme, darken }  from "@mui/material";

const PlayList = ({data, musicPlayerState, globalMethods, listStyles = {}, listProps = {}}) => {
  let theme = useTheme();
  let playOrder = musicPlayerState.playOrder;
  let musicIds = musicPlayerState.musicIds;
  let temporarySkip = musicPlayerState.temporarySkip;
  let items = []
  let darkBack = "darkred"
  for (let i = 0; i < playOrder.length; i++) {
    let character = playOrder[i];
    let musicId = musicIds[character];
    if (musicId !== -1) {
      let musicFilename = globalMethods.getMusicFilename(data, character, musicPlayerState);
      let [musicName, _] = globalMethods.getMusicName(musicFilename);
      let isPlaying = musicPlayerState.currentPlaying === character;
      items.push(
        <ListItem key={character} sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          maxHeight: "1.5em",
          textOverflow: "ellipsis",
          backgroundColor: isPlaying ? (darkBack) : "inherit",
          fontWeight: isPlaying ? "bold" : "normal",
          cursor: temporarySkip[character] ? "default" : "pointer",
          color: temporarySkip[character] ? "gray" : "white",
        }}
          onClick={temporarySkip[character] ? null : (() => {
            globalMethods.playMusicOfCharacter(character);
          })}
          cursor="pointer"
        >
          {character} ({musicName})
        </ListItem>
      );
    } else {
      // // do nothing
      // items.push(
      //   <ListItem key={character} sx={{
      //     whiteSpace: "nowrap",
      //     overflow: "hidden",
      //     maxHeight: "1.5em",
      //     textOverflow: "ellipsis",
      //     backgroundColor: "inherit",
      //     fontWeight: "normal",
      //     color: "gray",
      //   }}>
      //     {character}
      //   </ListItem>
      // );
    }
  }
  return <List sx={{
      overflow: 'auto',
      ...listStyles,
    }}
    {...listProps}
  >{items}</List>;
}
PlayList.displayName = "PlayList";

export default PlayList;