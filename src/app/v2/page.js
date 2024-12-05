'use client';

import { List, ListItem, Typography, Tabs, Tab, Paper, Box, Stack } from "@mui/material";
import CardComponent from "./cardComponent"
import { useState, useRef, useEffect, useTransition } from "react";
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import localFont from "next/font/local";
import { useTheme } from "@mui/material/styles";
import docCookies from "./docCookies";
import MusicPlayerPanel from "./musicPlayerPanel";
import { keyframes } from "@mui/material/styles";
import TransitionTab from "./transitionTab";

const relativeRoot = "./../"
const constrainedWidth = {
  width: '100%',
  '@media (min-width: 720px)': {
    width: '720px',
  },
  '@media (min-width: 1200px)': {
    width: '60%',
  },
}

const expandKeyframes = keyframes({
  "from": {
    marginLeft: "-7%",
    backgroundColor: "red"
  },
  "to": {
    marginLeft: "0%",
    backgroundColor: "blue"
  }
})


const inter = localFont({ 
  src: [{
    path: './../yumin.ttf',
    weight: 'normal',
  }],
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: inter
  }
});

const BoxPaper = ({ children }) => {
  return <Box sx={{width: "100%"}} padding={1}>
    <Paper variant="outlined" sx={{
      overflow: "hidden",
    }}>
      <Box padding={1}>
      {children}
      </Box>
    </Paper>
  </Box>
}

function loadCookies(data, getDefaultValue = false) {
  let dataCharacters = data["data"];
  let characters = Object.keys(dataCharacters);
  
  let musicPlayerState = {
    "playOrder": characters,
    "currentPlaying": characters[0],
  }
  {
    let musicIds = {};
    let temporarySkip = {};
    characters.forEach((character, index) => {
      musicIds[character] = 0;
      temporarySkip[character] = false;
    })
    musicPlayerState["musicIds"] = musicIds;
    musicPlayerState["temporarySkip"] = temporarySkip;
  }
  if (getDefaultValue) {
    return musicPlayerState;
  }

  {
    try {
      let playOrder = docCookies.getItem("playOrder");
      let loaded = []
      if (playOrder !== null) {
        playOrder = playOrder.split(",");
        playOrder.forEach((idString) => {
          let v = parseInt(idString);
          if (v < 0 || v >= characters.length) {
            throw new Error("Invalid playOrder cookie");
          }
          loaded.push(characters[v]);
        })
        musicPlayerState["playOrder"] = loaded;
      }
    } catch (e) {
      console.error("Error loading playOrder from cookies", e);
      docCookies.removeItem("playOrder");
    }
  }

  {
    try {
      let currentPlaying = docCookies.getItem("currentPlaying");
      if (currentPlaying !== null) {
        let v = parseInt(currentPlaying);
        if (v < 0 || v >= characters.length) {
          throw new Error("Invalid currentPlaying cookie");
        }
        musicPlayerState["currentPlaying"] = characters[v];
      }
    } catch (e) {
      console.error("Error loading currentPlaying from cookies", e);
      docCookies.removeItem("currentPlaying");
    }
  }

  return musicPlayerState;

}

export default function Page() {
  let [highlight, setHighlight] = useState(0);
  const cardRefs = useRef([]);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [musicPlayerState, setMusicPlayerState] = useState({
    "playOrder": [],
    "currentPlaying": "",
    "musicIds": {},
    "temporarySkip": {},
    "playingCountdownTimeout": null,
  });
  const [globalSettingState, setGlobalSettingState] = useState({
    "cardPrefix": "./cards/",
    "relativeRoot": relativeRoot,
    "randomPlayPosition": false,
    "countdown": false,
  });
  const [tabValue, setTabValue] = useState(0);

  const musicPlayerPanelExposedMethodsRef = useRef({});

  useEffect(() => {
    if (!isLoading) return;
    fetch('data.json')
      .then(response => response.json())
      .then(data => {
        setData(data);

        let loadedCookies = loadCookies(data);
        setMusicPlayerState(loadedCookies);

        setIsLoading(false);
      })
  })

  const handleTabsChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const onPreviousMusicClick = () => {
    let playOrder = musicPlayerState.playOrder;
    let currentPlayingIndex = playOrder.indexOf(musicPlayerState.currentPlaying);
    let previousIndex = (currentPlayingIndex - 1 + playOrder.length) % playOrder.length;
    let previousCharacter = playOrder[previousIndex];
    setMusicPlayerState({
      ...musicPlayerState,
      currentPlaying: previousCharacter
    });
    docCookies.setItem("currentPlaying", previousIndex);
  }

  const characterInPlaylist = (musicPlayerState, character, allowTemporarySkip = false) => {
    if (musicPlayerState.musicIds[character] === -1) {
      return false;
    }
    if (!allowTemporarySkip) {
      if (musicPlayerState.temporarySkip[character]) {
        return false;
      }
    }
    return true;
  }
  const findNextCharacterInPlaylist = (musicPlayerState, character) => {
    let playOrder = musicPlayerState.playOrder;
    let currentIndex = playOrder.indexOf(character);
    for (let i = 1; i < playOrder.length; i++) {
      let nextIndex = (currentIndex + i) % playOrder.length;
      let nextCharacter = playOrder[nextIndex];
      if (characterInPlaylist(musicPlayerState, nextCharacter)) {
        return nextCharacter;
      }
    }
    return null;
  }
  const findPreviousCharacterInPlaylist = (musicPlayerState, character) => {
    let playOrder = musicPlayerState.playOrder;
    let currentIndex = playOrder.indexOf(character);
    for (let i = 1; i < playOrder.length; i++) {
      let previousIndex = (currentIndex - i + playOrder.length) % playOrder.length;
      let previousCharacter = playOrder[previousIndex];
      if (characterInPlaylist(musicPlayerState, previousCharacter)) {
        return previousCharacter;
      }
    }
    return null;
  }
  const findFirstCharacterInPlaylist = (musicPlayerState) => {
    let playOrder = musicPlayerState.playOrder;
    for (let i = 0; i < playOrder.length; i++) {
      let character = playOrder[i];
      if (characterInPlaylist(musicPlayerState, character)) {
        return character;
      }
    }
    return null;
  }

  const playNextMusic = (additionalToSet = {}) =>{
    let playOrder = musicPlayerState.playOrder;
    let currentPlayingIndex = playOrder.indexOf(musicPlayerState.currentPlaying);
    let nextIndex = (currentPlayingIndex + 1) % playOrder.length;
    let nextCharacter = playOrder[nextIndex];
    setMusicPlayerState({
      ...musicPlayerState,
      ...additionalToSet,
      currentPlaying: nextCharacter
    });
    docCookies.setItem("currentPlaying", nextIndex);
  }
  
  const onNextMusicClick = () => {
    if (!globalSettingState.countdown) {
      playNextMusic();
      return;
    } else {
      if (musicPlayerPanelExposedMethodsRef.current) {
        musicPlayerPanelExposedMethodsRef.current.playCountdown();
      }
      setMusicPlayerState({
        ...musicPlayerState,
        playingCountdownTimeout: setTimeout(() => {
          playNextMusic({
            playingCountdownTimeout: null
          });
        }, 3000)
      })
    }
  }

  const reroll = (random = false) => {
    if (musicPlayerPanelExposedMethodsRef.current) {
      musicPlayerPanelExposedMethodsRef.current.pause();
    }
    let characters = Object.keys(data.data);
    let temporarySkip = {};
    for (let i = 0; i < characters.length; i++) {
      temporarySkip[characters[i]] = false;
    }
    let playOrder = [];
    for (let i = 0; i < characters.length; i++) {
      if (musicPlayerState.musicIds[characters[i]] !== -1) {
        playOrder.push(characters[i]);
      }
    }
    if (random) {
      for (let i = playOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        let temp = playOrder[i];
        playOrder[i] = playOrder[j];
        playOrder[j] = temp;
      }
    }
    let newMusicPlayerState = {
      ...musicPlayerState,
      playOrder: playOrder,
      temporarySkip: temporarySkip,
    }
    let currentPlaying = findFirstCharacterInPlaylist(newMusicPlayerState);
    newMusicPlayerState.currentPlaying = currentPlaying;
    setMusicPlayerState(newMusicPlayerState);
  }

  const globalControlMethods = {
    "reroll": reroll,
  }

  return <ThemeProvider theme={darkTheme}>
    {isLoading ? <div>Loading...</div> : <Box align="center" alignItems="center" justifyContent="center" sx={{width: "100%"}}>
      <Box sx={{
        width: '100%',
      }} 
      padding={1}
      align="center" alignItems="center" justifyContent="center"
      >
        Hello ther

        <Tabs value={tabValue} onChange={handleTabsChange}>
          <Tab label="Music Player" />
          <Tab label="Tab 2" />
          <Tab label="Tab 3" />
        </Tabs>

        <Box sx={{
          display: "flex",
          flexWrap: "nowrap",
          overflow: "hidden",
        }} paddingTop={1}>
          <TransitionTab index={0} value={tabValue}>
            <BoxPaper>
              <MusicPlayerPanel
                data={data}
                musicPlayerState={musicPlayerState}
                globalSettingState={globalSettingState}
                onNextClick={onNextMusicClick}
                onPreviousClick={onPreviousMusicClick}
                globalControlMethods={globalControlMethods}
                exposeMethods={musicPlayerPanelExposedMethodsRef}
              ></MusicPlayerPanel>
            </BoxPaper>
            <BoxPaper>
              <Stack spacing={1} align="center" alignItems="center">
                <Stack direction="row" spacing={1}>
                  <Button className="chinese" variant="outlined" color="warning" onClick={() => {reroll(true);}}>重新抽选</Button>
                  <Button className="chinese" variant="outlined" color="warning" onClick={() => {reroll(false);}}>顺序排列</Button>
                  <Button className="chinese" variant={globalSettingState.randomPlayPosition ? "contained" : "outlined"} color="primary" onClick={() => {
                    setGlobalSettingState({
                      ...globalSettingState,
                      randomPlayPosition: !globalSettingState.randomPlayPosition
                    });
                  }}>随机位置播放</Button>
                  <Button className="chinese" variant={globalSettingState.countdown ? "contained" : "outlined"} color="primary" onClick={() => {
                    setGlobalSettingState({
                      ...globalSettingState,
                      countdown: !globalSettingState.countdown
                    });
                  }}>倒计时</Button>
                </Stack>
              </Stack>
            </BoxPaper>
          </TransitionTab>
          <TransitionTab index={1} value={tabValue}><BoxPaper>
            Hello there 2
          </BoxPaper></TransitionTab>
          <TransitionTab index={2} value={tabValue}><BoxPaper>
            Hello there 3
          </BoxPaper></TransitionTab>
        </Box>


      </Box>
    </Box>}
  </ThemeProvider>

  let itemRefs = useRef([])
  let a = []
  for (let i = 0; i < 50; i++) {
    a.push(i)
  }
  let items = a.map((i) => {
    return <ListItem key={i} ref={el => itemRefs.current[i] = el}> 
      <Typography sx={{color: i === highlight ? "red" : "white"}}>
        Some text {i}
      </Typography>
    </ListItem>
  })
  let box = <Box sx={{
    border: "1px solid white",
    width: "1000px",
    height: "800px",
    overflow: "auto",
  }}>
    <List>
      {items}
    </List>
  </Box>
  return <div>
    Hello there
    
    <Stack direction="row" onMouseOver={() => {
        setIsHovering(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
      }}
      >
        <CardComponent src="../cards/咲夜.png" width="20%" elevation="6"
          paperStyles={{
            zIndex: 1, marginLeft: "0%"
          }}
        ></CardComponent>
        <CardComponent src="../cards/tall.png" width="20%" elevation="6"
          paperStyles={{
            zIndex: 2, marginLeft: isHovering ? "0%" : "-7%", transition: "margin-left 1s ease-out"
          }}
        ></CardComponent>
        <CardComponent src="../cards/wide.png" width="20%" elevation="6"
          paperStyles={{
            zIndex: 3, marginLeft: isHovering ? "0%" : "-7%", transition: "margin-left 1s ease-out"
          }}
        ></CardComponent>
      </Stack>
    <Stack direction="row">
      <CardComponent src="../cards/咲夜.png" width="20%"></CardComponent>
    </Stack>
    <Button onClick={() => {
      let random = Math.floor(Math.random() * 50)
      setHighlight(random)
      itemRefs.current[random].scrollIntoView({behavior: "smooth"})
    }}>
      Click me
    </Button>
    {box}
  </div>
}