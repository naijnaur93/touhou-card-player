'use client';

import React, { useState, useEffect, useRef } from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import CheckBox from '@mui/material/Checkbox';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';

const musicFilePrefix = "";

import localFont from "next/font/local";
const inter = localFont({ 
  src: [{
    path: './yumin.ttf',
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

function randomlyPermutePlayOrder(playOrder) {
  let newPlayOrder = playOrder.slice();
  for (let i = newPlayOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newPlayOrder[i], newPlayOrder[j]] = [newPlayOrder[j], newPlayOrder[i]];
  }
  return newPlayOrder;
}

export default function Home() {

  const [isLoading, setIsloading] = useState(true);
  const [data, setData] = useState({});
  const [playOrder, setPlayOrder] = useState([]);
  const [currentPlayingId, setCurrentPlayingId] = useState(0);
  const [cardIds, setCardIds] = useState({});
  const [musicIds, setMusicIds] = useState({});
  const [playLength, setPlayLength] = useState(0); // seconds
  const [isRandomStart, setIsRandomStart] = useState(false);
  const [pauseTimeout, setPauseTimeout] = useState(null);
  const [haveInput, setHaveInput] = useState(false);
  const [idPresets, setIdPresets] = useState({});
  const [idPresetHelp, setIdPresetHelp] = useState(null);
  const [playCountdown, setPlayCountdown] = useState(false);
  const [playTimeout, setPlayTimeout] = useState(null);
  const [gameSimulatorEnabled, setGameSimulatorEnabled] = useState(false);

  const audioPlayerRef = useRef(null);
  const countdownPlayerRef = useRef(null);

  useEffect(() => {
    if (audioPlayerRef.current === null) return;
    audioPlayerRef.current.load();
  }, [currentPlayingId]);

  function playNextMusic() {
    
    // find the index of the currentPlayingId in playOrder
    let index = playOrder.indexOf(currentPlayingId);
    // if the currentPlayingId is not in playOrder
    if (index === -1) {
      index = 0;
    }
    index = (index + 1) % playOrder.length;
    while (musicIds[playOrder[index]] === -1) {
      index = (index + 1) % playOrder.length;
    }

    setHaveInput(true);
    setCurrentPlayingId(playOrder[index]);
  }

  function nextMusic() {
    if (playTimeout !== null) {
      clearTimeout(pauseTimeout);
    }

    if (playCountdown) {
      let asyncTask = function() {
        playNextMusic();
      }
      if (audioPlayerRef.current !== null) {
        audioPlayerRef.current.pause();
      }
      let timeout = setTimeout(asyncTask, 3000);
      setPlayTimeout(timeout);
      countdownPlayerRef.current.currentTime = 0;
      countdownPlayerRef.current.play();
    } else {
      playNextMusic();
    }
  }

  function previousMusic() {
    setHaveInput(true);
    // find the index of the currentPlayingId in playOrder
    let index = playOrder.indexOf(currentPlayingId);
    index = (index - 1 + playOrder.length) % playOrder.length;
    while (musicIds[playOrder[index]] === -1) {
      index = (index - 1 + playOrder.length) % playOrder.length;
    }
    setCurrentPlayingId(playOrder[index]);
    // force audio reload
    audioPlayerRef.current.load();
  }

  function onMusicLoaded() {
    // if timeout is not null, clear it
    if (pauseTimeout !== null) {
      clearTimeout(pauseTimeout);
    }
    // get length of the audio
    let audio = audioPlayerRef.current;
    let duration = audio.duration;
    let selectableLength = Math.max(Math.min(duration - 30, duration - playLength), 0);
    let startTime = 0;
    if (selectableLength > 0 && isRandomStart) {
      startTime = Math.random() * selectableLength;
    }
    audio.currentTime = startTime;
    // start playing
    if (haveInput) audio.play();
    if (playLength > 0) {
      let task = setTimeout(() => {
        audio.pause();
        setPauseTimeout(null);
      }, playLength * 1000);
      setPauseTimeout(task);
    }
  }

  function getMusicName(character, musicId, withAlbum = false) {
    let musicsList = data[character]["music"];
    let musicName = "";
    // if musicsList is a str, then musicId must be 0
    if (typeof musicsList === 'string') {
      if (musicId !== 0) {
        musicId = 0;
      }
      musicName = musicsList;
    } else {
      musicName = musicsList[musicId];
    }
    let albumName = ""
    if (withAlbum) {
      // album is the string before first "/"
      albumName = musicName.substring(0, musicName.indexOf('/'));
    }
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
    if (withAlbum) {
      return musicName + " (" + albumName + ") ";
    }
    return musicName;
  }

  function getMusicUrl(character, musicId) {
    let musicList = data[character]["music"];
    let musicUrl = "";
    // if musicsList is a str, then musicId must be 0
    if (typeof musicList === 'string') {
      musicUrl = musicList;
    } else {
      musicUrl = musicList[musicId];
    }
    return "/music/" + musicFilePrefix + musicUrl;
  }

  function reroll() {
    setHaveInput(false);
    let ids = []
    Object.entries(data).forEach(([character, value]) => {
      let tags = value["tags"];
      // check if any tag in banned tags. if contain, skip
      for (let i = 0; i < tags.length; i++) {
        if (tagsBanned[tags[i]]) {
          return;
        }
      }
      ids.push(character);
    });
    // permute the ids
    let permuted = randomlyPermutePlayOrder(ids);
    setPlayOrder(permuted);
    if (ids.length > 0) {
      setCurrentPlayingId(permuted[0]);
      // force audio reload
      audioPlayerRef.current.load();
    }
  }

  function renderCurrentPlaying() {
    let character = currentPlayingId;
    let musicId = musicIds[character];
    let musicName = getMusicName(character, musicId);
    let musicUrl = getMusicUrl(character, musicId);
    let cards = []
    let cardList = data[character]["card"];
    if (typeof cardList === 'string') {
      cards.push(cardList);
    } else {
      cards = cardList;
    }
    let cardComponents = []
    for (let i = 0; i < cards.length; i++) {
      let card = cards[i];
      cardComponents.push(
        // 30% of the width
        <Paper key={card} variant="outlined"
          sx={{
            backgroundColor: "white",
            width: "30%",
            padding: 1,
          }}>
          <img key={card} 
            src={"/cards/" + card} 
            alt={card}
            style={{width: "100%", height: "auto"}}
          />
        </Paper>
      );
    }
    return (
      <Box padding={2} align="center">
        <Typography sx={{fontSize: "1.5em"}}>{musicName}</Typography>
        <Typography sx={{fontSize: "1.2em"}}>{character}</Typography>
        <Stack direction="row" spacing={2} padding={2} alignItems="center" justifyContent={"center"}>
          {cardComponents}
        </Stack>
        <Box align="center">
          <audio controls sx={{
              width: "100%",
            }} 
            ref={audioPlayerRef}
            onLoadedData={onMusicLoaded}
          >
            <source src={musicUrl} type="audio/mpeg" />
          </audio>
        </Box>
        <Stack direction="row" spacing={2} padding={2} alignItems="center" justifyContent={"center"}>
          <Button onClick={previousMusic} variant="outlined" width="100" className="chinese">上一曲</Button>
          <Button onClick={() => {
            let audio = audioPlayerRef.current;
            setHaveInput(true);
            if (audio.paused) {
              audio.play();
            } else {
              audio.pause();
            }
          }} variant="outlined" width="100" className="chinese">播放|暂停</Button>
          <Button onClick={nextMusic} variant="outlined" width="100" className="chinese">下一曲</Button>
        </Stack>
        <Stack direction="row" spacing={0} padding={0} alignItems="center" justifyContent={"center"}>
          <Button onClick={reroll} variant="outlined" width="100" className="chinese">
            重新抽选
          </Button>
          
        </Stack>
        <Grid container paddingTop={2} alignItems="center" justifyContent={"center"}>
          <Grid item xs={4}>
            <TextField id="playLengthTextField" label="播放时长（0 = 无限）" variant="outlined" size="small"
              className="chinese"
              value={playLength} 
              onChange={(event) => setPlayLength(event.target.value)}
              type="text"
              // min is 0, max is 180, step is 0.25
              inputProps={{min: 0, max: 180, step: 0.25}}
            />
          </Grid>
          <Grid item xs={4} className="chinese">
            <CheckBox
              checked={isRandomStart}
              onChange={(event) => setIsRandomStart(event.target.checked)}
              inputProps={{ 'aria-label': 'controlled' }}
            />
            随机位置
          </Grid>
          <Grid item xs={4} className="chinese">
            <CheckBox
              checked={playCountdown}
              onChange={(event) => setPlayCountdown(event.target.checked)}
              inputProps={{ 'aria-label': 'controlled' }}
            />
            倒计时
          </Grid>
        </Grid>
      </Box>
    );
  }

  function renderPlayList() {
    let items = []
    for (let i = 0; i < playOrder.length; i++) {
      let character = playOrder[i];
      let musicId = musicIds[character];
      if (musicId === -1) {
        continue;
      }
      let musicName = getMusicName(character, musicId);
      let isPlaying = currentPlayingId === character;
      items.push(
        <ListItem key={character} sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          maxHeight: "1.5em",
          textOverflow: "ellipsis",
          backgroundColor: isPlaying ? "darkred" : "inherit",
          fontWeight: isPlaying ? "bold" : "normal",
        }}
          onClick={() => {
            setCurrentPlayingId(character)
            // force audio reload
            audioPlayerRef.current.load();
          }}
          cursor="pointer"
        >
          {character} ({musicName})
        </ListItem>
      );
    }
    return <List sx={{
      overflow: 'auto',
    }}>{items}</List>;
  }

  function renderMusicIdSelector() {
    let selectors = []
    let presets = []
    Object.entries(idPresets).forEach(([presetName, presetData]) => {
      presets.push(
        <Box margin={0.5} key={presetName}>
          <ButtonGroup variant="outlined" key={presetName} aria-label="Basic button group">
            <Button key={presetName} onClick={() => {
              let newMusicIds = {}
              for (let key in musicIds) {
                newMusicIds[key] = musicIds[key];
              }
              for (let key in presetData) {
                newMusicIds[key] = presetData[key];
              }
              setMusicIds(newMusicIds);
              setIdPresetHelp(presetName);
              // if currentPlayingId is in the preset
              if (currentPlayingId in presetData) {
                // if it is not -1, reload the audio
                if (presetData[currentPlayingId] === -1) {
                  let index = (playOrder.indexOf(currentPlayingId) + 1) % playOrder.length;
                  while (newMusicIds[playOrder[index]] === -1) {
                    index = (index + 1) % playOrder.length;
                  }
                  setCurrentPlayingId(playOrder[index]);
                }
              }
            }} variant="outlined" width="100" className="chinese">{presetName}</Button>
            <Button key={presetName + "Help"} onClick={() => setIdPresetHelp(idPresetHelp === presetName ? null : presetName)} variant="outlined" width="100" className="chinese">?</Button>
          </ButtonGroup>
        </Box>
      );
    });
    let idPresetHelpText = null;
    if (idPresetHelp !== null) {
      let preset = idPresets[idPresetHelp];
      let textList = []
      for (let key in preset) {
        let musicName = "移除";
        if (preset[key] !== -1) {
          musicName = getMusicName(key, preset[key], true);
        }
        textList.push("・" + key + " ⇒ " + musicName);
      }
      idPresetHelpText = <List sx={{
      }}>
        {textList.map((text) => {
        return <ListItem sx={{
          whiteSpace: "nowrap",
          overflow: "visible",
          maxHeight: "1.5em",
        }} key={text + "HelpText"}>
          {text}
        </ListItem>
        })}
      </List>;
    }
    Object.entries(data).forEach(([character, value]) => {
      let musicList = value["music"];
      if (musicList === undefined) {
        return;
      }
      if (typeof musicList === 'string') {
        musicList = [musicList];
      }
      let musicNames = []
      for (let i = 0; i < musicList.length; i++) {
        musicNames.push(getMusicName(character, i, true));
      }
      selectors.push(
        <FormControl variant="outlined" key={character}>
          <FormLabel>{character}</FormLabel>
          <RadioGroup 
            key={character} 
            variant="outlined"
            value={musicIds[character]} 
            onChange={(event) => {
              let newMusicIds = {}
              for (let key in musicIds) {
                newMusicIds[key] = musicIds[key];
              }
              newMusicIds[character] = parseInt(event.target.value);
              setMusicIds(newMusicIds);
              if (currentPlayingId === character && newMusicIds[character] === -1) {
                let index = (playOrder.indexOf(character) + 1) % playOrder.length;
                while (newMusicIds[playOrder[index]] === -1) {
                  index = (index + 1) % playOrder.length;
                }
                setCurrentPlayingId(playOrder[index]);
              }
            }}
          >
            {musicNames.map((musicName, index) => {
              return (
                <FormControlLabel 
                  key={index} 
                  value={index} 
                  control={<Radio />} 
                  label={musicName}
                  size="small"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    height: "1.5em",
                  }}
                />
              );
            })}
            <FormControlLabel 
              key={-1} 
              value={-1} 
              control={<Radio />} 
              label="移除"
              size="small"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                height: "1.5em",
              }}
            />
          </RadioGroup>
        </FormControl>
      );
    });
    return (
      <Box overflow="auto" padding={2}>
        <Stack spacing={2}>
          <Typography variant="h6" class="chinese">预设快速选择</Typography>
          <Grid container spacing={2}>
            {presets}
          </Grid>
          {idPresetHelpText}
          <Typography variant="h6" class="chinese">角色单曲选择</Typography>
          {selectors}
        </Stack>
      </Box>
    )
  }

  function renderAllMusicPlayer() {
    return (
      <Grid container spacing={2} padding={2}>
        
        <div display="none">
          <audio ref={countdownPlayerRef}>
            <source src="/Bell3.mp3" type="audio/mpeg" />
          </audio>
        </div>

        <Grid item xs={12} sm={6}>
          <Stack spacing={2}>
  
            <Paper elevation={3} padding={2}>
              {renderCurrentPlaying()}
            </Paper>

            <Paper elevation={3} padding={2}>
              {renderPlayList()}
            </Paper>

  
          </Stack>
        </Grid>
  
        <Grid item xs={12} sm={6}>
          <Stack spacing={2}>

            <Paper elevation={3} padding={2}>
              <Box>
                {renderMusicIdSelector()}
              </Box>
            </Paper>
  
          </Stack>
        </Grid>
      </Grid>
    )
  }
  
  function renderGameSimulator() {
    return <Grid container spacing={2} padding={2}>
      <Grid item sm={12}>
        <Stack>
          <Paper elevation={3} padding={2}>
            <CheckBox 
              checked={gameSimulatorEnabled}
              onChange={(event) => setGameSimulatorEnabled(event.target.checked)}
              inputProps={{ 'aria-label': 'controlled' }}
            />模拟器
          </Paper>

          {gameSimulatorEnabled ? <Paper elevation={3} padding={2}><Box padding={2}>
            <Typography variant="h6" className="chinese">选择卡片</Typography>
            <Typography variant="body1" className="chinese">从下面序列中选择</Typography>
            
            </Box></Paper> : <></>}
        </Stack>
      </Grid>
    </Grid>
  }

  function renderAll() {

    return (
      <>
        {renderGameSimulator()}
        <div style={{
          display: gameSimulatorEnabled ? "none" : "block",
        }}>
          {renderAllMusicPlayer()}
        </div>  
      </>
    )
  }

  useEffect(() => {
    // fetch data.json
    if (!isLoading) return;
    fetch('data.json')
      .then(response => response.json())
      .then(data => {
        if (!isLoading) return;
        // get the length of the dictionary
        let characterCount = Object.keys(data).length;
        // card Ids all set to 0 initially
        let cardIds = {}
        Object.entries(data).forEach(([key, value]) => {
          cardIds[key] = 0;
        });
        // music ids all set to 0 initially
        let musicIds = {}
        Object.entries(data).forEach(([key, value]) => {
          musicIds[key] = 0;
        });
        // play order
        let playOrder = []
        Object.entries(data).forEach(([key, value]) => {
          playOrder.push(key);
        });
        // at start all tags are not banned
        let tagsBanned = {}
        Object.entries(data).forEach(([key, value]) => {
          let tags = value["tags"];
          if (tags === undefined) {
            return;
          }
          for (let i = 0; i < tags.length; i++) {
            tagsBanned[tags[i]] = false;
          }
        });
        // set the state
        setData(data);
        setPlayOrder(playOrder);
        setCardIds(cardIds);
        setMusicIds(musicIds);
        setCurrentPlayingId(playOrder[0]);
        setIsloading(false);
        // audioPlayerRef.current.volume = 0.5;
        
        fetch('idpresets.json')
        .then(response => response.json())
        .then(fetchedData => {
          let defaultPreset = {}
          Object.entries(musicIds).forEach(([key, value]) => {
            defaultPreset[key] = 0;
          })
          let presetsData = {}
          presetsData["默认"] = defaultPreset;

          Object.entries(fetchedData).forEach(([key, value]) => {
            presetsData[key] = value;
          })

          Object.entries(tagsBanned).forEach(([tagName, value]) => {
            let preset = {}
            Object.entries(data).forEach(([key, value]) => {
              let tags = value["tags"];
              // check if any tag in banned tags. if contain, skip
              for (let i = 0; i < tags.length; i++) {
                if (tags[i] === tagName) {
                  preset[key] = -1;
                  break;
                }
              }
            })
            presetsData["屏蔽" + tagName] = preset;
          })

          setIdPresets(presetsData); 
        })

      })
      .catch(error => console.error('Error:', error));
  }, [isLoading, currentPlayingId]);

  return (<ThemeProvider theme={darkTheme}> 
    <div>
    {isLoading ? (
      <p>Loading...</p>
    ) : (
      renderAll()
    )} 
    </div>
  </ThemeProvider>);
}
