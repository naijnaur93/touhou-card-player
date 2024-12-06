'use client';

import { List, ListItem, Typography, Tabs, Tab, Paper, Box, Stack, TextField } from "@mui/material";
import { useState, useRef, useEffect, useMemo } from "react";
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import localFont from "next/font/local";
import docCookies from "./docCookies";
import MusicPlayerPanel from "./musicPlayerPanel";
import { keyframes } from "@mui/material/styles";
import TransitionTab from "./transitionTab";
import { getMusicFilename, getMusicName } from "./utils";
import PlayList from "./playList";
import { PlaySlider, PlayControls } from "./playControls";
import MusicIdSelectPanel from "./musicIdSelectPanel";

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

const BoxPaper = ({ children, padding = 1}) => {
  return <Box sx={{width: "100%"}} padding={1}>
    <Paper variant="outlined" sx={{
      overflow: "hidden",
    }}>
      <Box padding={padding}>
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

  {
    try {
      let cookieMusicIds = docCookies.getItem("musicIds");
      if (cookieMusicIds !== null) {
        cookieMusicIds = cookieMusicIds.split(",");
        let newMusicIds = {}
        cookieMusicIds.forEach((id, index) => {
          let v = parseInt(id);
          if (Number.isNaN(v) || v < -1 || v >= data.data[characters[index]]["music"].length) {
            throw "Invalid music id";
          }
          newMusicIds[characters[index]] = v;
        })
        if (newMusicIds[musicPlayerState.currentPlaying] === -1) {
          newMusicIds[musicPlayerState.currentPlaying] = 0;
        }
        musicPlayerState["musicIds"] = newMusicIds;
      }
    } catch (e) {
      console.error("Error loading musicIds from cookies", e);
      docCookies.removeItem("musicIds");
    }
  }

  return musicPlayerState;

}

export default function Page() {

  // get page url
  // let path = usePathname();
  // console.log(path);
  let relativeRoot = "../"

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [musicPlayerState, setMusicPlayerState] = useState({
    "playOrder": [],
    "currentPlaying": "",
    "musicIds": {},
    "temporarySkip": {},
  });
  const [playbackState, setPlaybackState] = useState({
    "playingCountdownTimeout": null,
    "playbackTimeout": null,
    "paused": true,
    "playbackPaused": false,
  })
  const [audioState, setAudioState] = useState({
    currentTime: 0,
    duration: 0,
  })
  const [optionState, setOptionState] = useState({
    "cardPrefix": "./cards/",
    "relativeRoot": relativeRoot,
    "randomPlayPosition": false,
    "countdown": false,
    "playbackTime": 0,
  });
  const audioRef = useRef(null);
  const audioCountdownRef = useRef(null);
  const [tabValue, setTabValue] = useState(0);

  const globalState = {
    musicPlayerState, setMusicPlayerState,
    playbackState, setPlaybackState,
    audioState, setAudioState,
    optionState, setOptionState,
  }
  const globalRefs = {
    audioRef, audioCountdownRef
  }

  useEffect(() => {
    if (!isLoading) return;
    fetch('data.json')
      .then(response => response.json())
      .then(data => {

        let idPresets = {};
        let characters = Object.keys(data.data);
        let defaultPreset = {}
        characters.forEach((key) => {
          defaultPreset[key] = 0;
        })
        idPresets["默认"] = defaultPreset;

        Object.entries(data.idpresets).forEach(([presetName, preset]) => {
          idPresets[presetName] = preset;
        })

        let tags = []
        Object.entries(data.data).forEach(([key, value]) => {
          value.tags.forEach((tag) => {
            if (!tags.includes(tag)) {
              tags.push(tag);
            }
          })
        });

        tags.forEach((tagName) => {
          let preset = {}
          Object.entries(data.data).forEach(([key, value]) => {
            let characterTags = value["tags"];
            if (characterTags.includes(tagName)) {
              preset[key] = -1;
            }
          })
          idPresets["屏蔽" + tagName] = preset;
        })

        data.idpresets = idPresets;

        setData(data);

        let loadedCookies = loadCookies(data);
        setMusicPlayerState(loadedCookies);

        setIsLoading(false);
      })
  })

  const handleTabsChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
        return [nextIndex, nextCharacter];
      }
    }
    return [null, null];
  }
  const findPreviousCharacterInPlaylist = (musicPlayerState, character) => {
    let playOrder = musicPlayerState.playOrder;
    let currentIndex = playOrder.indexOf(character);
    for (let i = 1; i < playOrder.length; i++) {
      let previousIndex = (currentIndex - i + playOrder.length) % playOrder.length;
      let previousCharacter = playOrder[previousIndex];
      if (characterInPlaylist(musicPlayerState, previousCharacter)) {
        return [previousIndex, previousCharacter];
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

  const userPause = () => {
    setPlaybackState({
      ...playbackState,
      paused: true
    });
    if (globalRefs.audioRef.current) {
      globalRefs.audioRef.current.pause();
    }
  }

  const playbackPause = () => {
    setPlaybackState({
      ...playbackState,
      playbackPaused: true
    });
    if (globalRefs.audioRef.current) {
      globalRefs.audioRef.current.pause();
    }
  }

  const playMusicOfCharacter = (character, additionalPlaybackState = {}, additionalMusicPlayerState = {}) => {
    let playbackTimeout = null;
    if (optionState.playbackTime > 0) {
      playbackTimeout = setTimeout(() => {
        playbackPause();
      }, optionState.playbackTime * 1000);
    }
    setPlaybackState({
      ...playbackState,
      ...additionalPlaybackState,
      playbackPaused: false,
      playbackTimeout: playbackTimeout
    })
    setMusicPlayerState({
      ...musicPlayerState,
      ...additionalMusicPlayerState,
      currentPlaying: character,
    });
    docCookies.setItem("currentPlaying", Object.keys(data.data).indexOf(character));
  }

  const playNextMusic = (additionalToSet = {}) =>{
    let [_, nextCharacter] = findNextCharacterInPlaylist(musicPlayerState, musicPlayerState.currentPlaying)
    playMusicOfCharacter(nextCharacter, additionalToSet)
  }
  
  const onNextMusicClick = () => {
    if (!optionState.countdown) {
      playNextMusic();
      return;
    } else {
      if (globalRefs.audioCountdownRef.current) {
        globalRefs.audioCountdownRef.current.play();
      }
      setPlaybackState({
        ...playbackState,
        playingCountdownTimeout: setTimeout(() => {
          playNextMusic({
            playingCountdownTimeout: null
          });
        }, 3000)
      })
    }
  }
  
  const onPreviousMusicClick = () => {
    let [_, previousCharacter] = findPreviousCharacterInPlaylist(musicPlayerState, musicPlayerState.currentPlaying)
    playMusicOfCharacter(previousCharacter);
  }

  const reroll = (random = false) => {
    userPause();
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
    
    // set cookies
    let playOrderString = playOrder.map((character) => {
      return characters.indexOf(character);
    }).join(",");
    docCookies.setItem("playOrder", playOrderString);
    docCookies.setItem("currentPlaying", characters.indexOf(currentPlaying));
  }

  const globalMethods = {
    "reroll": reroll,
    "setTemporarySkip": (character) => {
      let newTemporarySkip = {...musicPlayerState.temporarySkip}
      newTemporarySkip[character] = !newTemporarySkip[character];
      setMusicPlayerState({
        ...musicPlayerState,
        temporarySkip: newTemporarySkip
      })
    },
    "getMusicName": getMusicName,
    "getMusicFilename": getMusicFilename,
    "playMusicOfCharacter": playMusicOfCharacter,
    "characterInPlaylist": characterInPlaylist,
    "findNextCharacterInPlaylist": findNextCharacterInPlaylist,
    "findPreviousCharacterInPlaylist": findPreviousCharacterInPlaylist,
  }

  const onPauseMusicClick = () => {
    const playbackPaused = playbackState.playbackPaused;
    const paused = playbackState.paused;
    let updater = {...playbackState}
    if (!playbackPaused) updater.paused = !paused;
    updater.playbackPaused = false;
    setPlaybackState(updater);
    if (globalRefs.audioRef.current) {
      let audioRef = globalRefs.audioRef;
      if (paused || playbackPaused) {
        audioRef.current.play().catch((e) => {
          console.log("Failed to play", e);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }

  const memoizedMusicIdSelectPanel = useMemo(() => {
    return <MusicIdSelectPanel
      data={data} globalState={globalState} globalMethods={globalMethods}
    ></MusicIdSelectPanel>
  }, [data, globalState.musicPlayerState.musicIds, globalState.optionState.cardPrefix, globalMethods])

  return <ThemeProvider theme={darkTheme}>
    {isLoading ? <div>Loading...</div> : <Box align="center" alignItems="center" justifyContent="center" sx={{width: "100%"}}>
      <Box sx={{
        width: '100%',
      }} 
      padding={1}
      align="center" alignItems="center" justifyContent="center"
      >
        Hello ther

        <Tabs value={tabValue} onChange={handleTabsChange} className="chinese">
          <Tab label="卡牌播放器" />
          <Tab label="列表播放器" />
          <Tab label="曲目与卡片设定" />
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
                onNextClick={onNextMusicClick}
                onPauseClick={onPauseMusicClick}
                onPreviousClick={onPreviousMusicClick}
                globalMethods={globalMethods}
                globalRefs={globalRefs}
                globalState={globalState}
              ></MusicPlayerPanel>
            </BoxPaper>
            <BoxPaper>
              <Stack spacing={1} align="center" alignItems="center">
                <Stack direction="row" spacing={1}>
                  <Button className="chinese" variant="outlined" color="warning" onClick={() => {reroll(true);}}>重新抽选</Button>
                  <Button className="chinese" variant="outlined" color="warning" onClick={() => {reroll(false);}}>顺序排列</Button>

                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button className="chinese" variant={optionState.randomPlayPosition ? "contained" : "outlined"} color="primary" onClick={() => {
                    setOptionState({
                      ...optionState,
                      randomPlayPosition: !optionState.randomPlayPosition
                    });
                  }}>随机位置播放</Button>
                  <Button className="chinese" variant={optionState.countdown ? "contained" : "outlined"} color="primary" onClick={() => {
                    setOptionState({
                      ...optionState,
                      countdown: !optionState.countdown
                    });
                  }}>倒计时</Button>
                </Stack>
                <TextField id="playLengthTextField" label="播放时长（0 = 无限）" variant="standard"
                  className="chinese"
                  value={optionState.playbackTime} 
                  onChange={(event) => setOptionState({
                    ...optionState,
                    playbackTime: parseFloat(event.target.value)
                  })}
                  type="number"
                  sx={{
                    width: "clamp(150px, 30%, 240px)"
                  }}
                  // min is 0, max is 180, step is 0.25
                  inputProps={{min: 0, max: 180, step: 0.25}}
                />
              </Stack>
            </BoxPaper>
          </TransitionTab>
          <TransitionTab index={1} value={tabValue}><BoxPaper padding={0}>
            <Box paddingTop={1} width="100%"></Box>
            <PlayControls
              onPreviousClick={onPreviousMusicClick}
              onNextClick={onNextMusicClick}
              onPauseClick={onPauseMusicClick}
              globalState={globalState}
            ></PlayControls>
            <PlaySlider 
              globalState={globalState}
              globalRefs={globalRefs}
            ></PlaySlider>
            <PlayList 
              data={data} musicPlayerState={musicPlayerState} globalMethods={globalMethods}
              listStyles={{
                marginTop: "0.5em"
              }}
            ></PlayList>
          </BoxPaper></TransitionTab>
          <TransitionTab index={2} value={tabValue}><BoxPaper>
            {memoizedMusicIdSelectPanel}
          </BoxPaper></TransitionTab>
        </Box>


      </Box>
    </Box>}
  </ThemeProvider>

}