import {
  List, ListItem, Button, Box, Stack, Typography, IconButton, Slider
} from "@mui/material";
import {
  SkipNextRounded as RightIcon,
  SkipPreviousRounded as LeftIcon,
  PauseRounded as PauseIcon,
  PlayArrowRounded as PlayIcon,
} from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";
import CachedAudioPlayer from "./cachedAudioPlayer";
import CardComponent from "./cardComponent";
import { forwardRef } from "react";
import TransitionTab from "./transitionTab";
import * as utils from "./utils";
import { useTheme } from "@mui/material/styles";
import { PlayControls, PlaySlider } from "./playControls";

const ProminentCardGroup = forwardRef(({ 
  data, character, isFocused,
  musicFilename,
  globalState,
}, ref) => {
  let filenames = data["data"][character]["card"]
  if (typeof filenames === "string") {
    filenames = [filenames];
  }
  let optionState = globalState.optionState;
  filenames = filenames.map((filename) => {
    return optionState.relativeRoot + optionState.cardPrefix + filename;
  });
  const [musicName, albumName] = utils.getMusicName(musicFilename);
  return <Box
    ref={ref}
    sx={{
      align: "center",
      alignItems: "center",
      flexShrink: 0,
      width: "clamp(0px, 100%, 720px)",
    }}
  >
    <Stack direction="column" spacing={2} paddingTop={1}>
      <Stack direction="column" spacing={0}>
      <Typography sx={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "clamp(1em, 1.5em, 3vw)"}}>{musicName}</Typography>
      <Typography sx={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "clamp(0.8em, 1.2em, 2.4vw)"}}>{albumName}</Typography>
      <Typography sx={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "clamp(0.8em, 1.2em, 2.4vw)"}}>{character}</Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent={"center"}>
        {filenames.map((filename, index) => {
          return <CardComponent 
            key={index} src={filename} width="30%" elevation={6}
            paperStyles={{
              marginLeft: index === 0 ? "0%" : (isFocused ? "1%" : "-20%"),
              zIndex: filenames.length - index,
              transition: "margin-left 0.6s",
              transitionDelay: "0.4s"
            }}
          />
        })}
      </Stack>
    </Stack>
  </Box>
})
ProminentCardGroup.displayName = "ProminentCardGroup"

const QueueCardGroup = forwardRef(({ 
  data, containerWidthPixels,
  globalState, globalMethods,
}, ref) => {
  const singleInterval = 0.9;
  const pluralInterval = 0.4;
  const cardWidthRatio = 0.167;
  let cardWidth = containerWidthPixels * cardWidthRatio;
  if (cardWidth > 150) {cardWidth = 150;}
  const pluralMarginLeft = cardWidth * (1 - pluralInterval);
  const singleMarginLeft = cardWidth * (1 - singleInterval);
  const pastDisplacement = 0.5 * cardWidth;
  const musicPlayerState = globalState.musicPlayerState;
  const optionState = globalState.optionState;
  let playOrder = musicPlayerState.playOrder;
  let currentCharacter = musicPlayerState.currentPlaying;
  let queueItems = [];
  let totalFilenames = [];
  let totalCardCount = 0;
  const aspectRatio = 703/1000;
  const dy = cardWidth / aspectRatio * 0.05;
  
  const existentCharacters = []; // those with musicId != -1
  for (let i = 0; i < playOrder.length; i++) {
    let character = playOrder[i];
    if (musicPlayerState.musicIds[character] !== -1) {
      existentCharacters.push(character);
    }
  }

  let renderBeginIndex = existentCharacters.indexOf(currentCharacter);
  let renderShownIndex = renderBeginIndex + 1;
  {
    let i = renderBeginIndex;
    while (i > 0 && musicPlayerState.temporarySkip[existentCharacters[i - 1]]) { i--; }
    renderBeginIndex = i;
  }

  let displacement = singleMarginLeft;
  let placeholderWidth = singleMarginLeft;
  let renderOrder = [];
  {
    let accumulatedWidth = singleMarginLeft;
    let breakNext = false;
    let shownNotSkipped = false;
    for (let i = 0; i < existentCharacters.length; i++) {
      let character = existentCharacters[i];
      let filenames = data["data"][character]["card"]
      if (typeof filenames === "string") {
        filenames = [filenames];
      }
      filenames = filenames.map((filename) => {
        return optionState.relativeRoot + optionState.cardPrefix + filename;
      });

      const width = cardWidth * (1 + (filenames.length - 1) * pluralInterval);

      if (i < renderBeginIndex) {
        placeholderWidth += width - singleMarginLeft;
      } else {
        totalFilenames.push(filenames)
        renderOrder.push(character);
        totalCardCount += filenames.length;
      }

      if (i < renderShownIndex) {
        displacement -= width - singleMarginLeft;
      } else {
        if (!musicPlayerState.temporarySkip[character]) {
          shownNotSkipped = true;
        }
        if (shownNotSkipped) {
          accumulatedWidth += width - singleMarginLeft;
        }
        if (breakNext) {
          break;
        }
        if (accumulatedWidth > containerWidthPixels) {
          breakNext = true;
        }
      }
    }
    renderShownIndex -= renderBeginIndex;
    renderBeginIndex = 0;
  }

  {
    const width = placeholderWidth;
    let cardDisplacement = displacement - pastDisplacement;
    let transform = `translateX(${cardDisplacement}px)`;
    queueItems.push(<Box 
      key="placeholder"
      sx={{
        align: "center",
        alignItems: "center",
        flexShrink: 0,
        width: width + "px",
        position: "relative",
        transition: "transform 0.5s",
        transform: transform,
        marginLeft: "-" + singleMarginLeft + "px",
        marginTop: dy + "px",
        zIndex: totalCardCount,
      }}
    ></Box>);
  }

  {
    for (let i = 0; i < renderOrder.length; i++) {
      let character = renderOrder[i];
      let filenames = totalFilenames[i];
      const width = cardWidth * (1 + (filenames.length - 1) * pluralInterval);
      let cardDisplacement = displacement;
      if (i < renderShownIndex) cardDisplacement -= pastDisplacement;
      let transform = `translateX(${cardDisplacement}px)`;
      queueItems.push(<Box 
        key={character}
        sx={{
          align: "center",
          alignItems: "center",
          flexShrink: 0,
          width: width + "px",
          position: "relative",
          transition: "transform 0.5s",
          transform: transform,
          marginLeft: "-" + singleMarginLeft + "px",
          marginTop: dy + "px",
          zIndex: totalCardCount,
        }}
        onClick={() => {
          globalMethods.setTemporarySkip(character);
          console.log("click", character)
        }}
      >
        <Box sx={{
          transition: "transform 0.5s",
          ":hover": {
            transform: "translateY(-" + dy + "px)",
          }
        }}>
          <Stack direction="row" spacing={0} alignItems="center" justifyContent={"center"}>
            {filenames.map((filename, index) => {
              totalCardCount -= 1;
              return <CardComponent 
                key={character + index} src={filename} width={cardWidth + "px"} elevation={6}
                paperStyles={{
                  marginLeft: index === 0 ? "0%" : ("-" + pluralMarginLeft + "px"),
                  zIndex: filenames.length - 1 - index,
                  backgroundColor: musicPlayerState.temporarySkip[character] ? "lightgray" : "white",
                  ":hover": {
                    backgroundColor: musicPlayerState.temporarySkip[character] ? "#DAEBEB" : "lightcyan"
                  }
                }}
                imageStyles={{
                  filter: musicPlayerState.temporarySkip[character] ? "grayscale(100%)" : "none"
                }}
              ></CardComponent>
            })}
          </Stack>
        </Box>
      </Box>);
    }
  }

  console.log("QueueCardGroup item count = ", queueItems.length);
  return <Box ref={ref} sx={{
      display: "flex",
      flexWrap: "nowrap",
      overflowX: "hidden",
      overflowY: "visible",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      width: "100%",
    }}>
      {queueItems}
  </Box>
})
QueueCardGroup.displayName = "QueueCardGroup"

export default function MusicPlayerPanel({
  data, globalState, onNextClick = () => {}, onPreviousClick = () => {},
  onPauseClick = () => {},
  globalMethods, globalRefs,
}) {

  const theme = useTheme();
  const prominentCardGroupContainerRef = useRef(null);
  const prominentCardGroupFirstItemRef = useRef(null);
  const [layoutInfo, updateLayoutInfo] = useState({
    containerWidth: 0,
    containerHeight: 0,
    itemWidth: 0,
    itemHeight: 0,
  });

  const { 
    musicPlayerState, optionState, 
    playbackState, audioState,
    setAudioState
  } = globalState;
  const { audioRef, audioCountdownRef } = globalRefs;

  const isPlayingCountdown = playbackState.playingCountdownTimeout !== null;

  const paused = playbackState.paused;
  const playbackPaused = playbackState.playbackPaused;
  
  useEffect(() => {
    const handleResize = () => {
      let updater = {}
      if (prominentCardGroupContainerRef.current) {
        updater = {
          ...updater,
          containerHeight: prominentCardGroupContainerRef.current.clientHeight,
          containerWidth: prominentCardGroupContainerRef.current.clientWidth,
        }
      }
      if (prominentCardGroupFirstItemRef.current) {
        updater = {
          ...updater,
          itemHeight: prominentCardGroupFirstItemRef.current.clientHeight,
          itemWidth: prominentCardGroupFirstItemRef.current.clientWidth,
        }
      }
      let flag = false;
      Object.keys(updater).forEach((key, index) => {
        if (layoutInfo[key] != updater[key]) {
          flag = true;
        }
      })
      if (flag) {
        updateLayoutInfo({
          ...layoutInfo,
          ...updater
        });
      }
    };
  
    window.addEventListener('resize', handleResize);
    handleResize(); // Call the function initially to set the layout
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [layoutInfo])

  let dataCharacters = data["data"];

  function getMusicNameOfCharacter(character) {
    let musicList = dataCharacters[character]["music"];
    if (typeof musicList === "string") {
      musicList = [musicList];
    }
    let id = musicPlayerState.musicIds[character];
    if (id >= 0) {
      return musicList[id];
    } else {
      throw ("Trying to find -1 music of " + character)
    }
  }

  let currentCharacter = musicPlayerState.currentPlaying;
  let currentSource = data["sources"][getMusicNameOfCharacter(currentCharacter)];
  let playOrder = musicPlayerState.playOrder;
  let currentIndexInPlayOrder = playOrder.indexOf(currentCharacter);
  let [_, nextCharacter] = globalMethods.findNextCharacterInPlaylist(musicPlayerState, currentCharacter);
  let nextSource = data["sources"][getMusicNameOfCharacter(nextCharacter)];

  let [audioPlayer, prepareAudio] = CachedAudioPlayer({ src: currentSource, onFetched: (src) => {
    if (src === currentSource) {
      if (!paused) {
        audioRef.current.play().catch((e) => {
          console.log("Failed to play", e);
        });
      }
    }
  }, onLoaded: () => {
    let position = 0;
    if (optionState.randomPlayPosition) {
      position = Math.random() * Math.max(audioRef.current.duration - 10, 0);
    }
    setAudioState({
      currentTime: position,
      duration: audioRef.current.duration,
    });
    audioRef.current.currentTime = position;
  }, globalRefs: globalRefs});
  prepareAudio(nextSource);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", () => {
        setAudioState({
          currentTime: audioRef.current.currentTime,
          duration: audioRef.current.duration,
        });
      });
    }
  }, [audioRef, setAudioState]);

  useEffect(() => {
    if (isPlayingCountdown) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } 
  }, [isPlayingCountdown, audioRef]);

  let switchSongButtonSize = layoutInfo.containerWidth * 0.125;
  let switchSongButtonTop = layoutInfo.containerHeight * 0.5 - switchSongButtonSize / 2;
  let switchSongButtonXDisplacement = layoutInfo.itemWidth / 2;
  let prevSongButtonLeft = layoutInfo.containerWidth / 2 - switchSongButtonXDisplacement - switchSongButtonSize;
  let nextSongButtonLeft = layoutInfo.containerWidth / 2 + switchSongButtonXDisplacement;

  let prominents = [];
  let counter = 0;
  let value = 0;
  playOrder.forEach((character, index) => {
    if (musicPlayerState.musicIds[character] === -1) return;
    if (character === currentCharacter) {
      value = counter;
    }
    counter++;
  })
  
  playOrder.forEach((character, index) => {
    if (musicPlayerState.musicIds[character] === -1) return;
    prominents.push(<TransitionTab key={character} index={counter} value={value}>
      <ProminentCardGroup 
        key={character}
        data={data} character={character} 
        globalState={globalState}
        musicFilename={utils.getMusicFilename(data, character, musicPlayerState)}
        isFocused={index === currentIndexInPlayOrder}
        ref={counter === 0 ? prominentCardGroupFirstItemRef : null}
      />
    </TransitionTab>)
    counter++;
  })

  return <Stack spacing={1} align="center" alignItems="center">
    <Box width="100%" align="center" alignItems="center">
      <Box sx={{
        display: "flex",
        flexWrap: "nowrap",
      }} ref={prominentCardGroupContainerRef}
      >
        {/* <Box sx={{
          width: 0,
          height: 0,
          position: "relative",
          zIndex: playOrder.length + 1,
        }}>
          <IconButton onClick={onPreviousClick} variant="outlined" color="primary" disabled={isPlayingCountdown}
            sx={{
              position: "absolute",
              top: switchSongButtonTop,
              left: prevSongButtonLeft,
              height: switchSongButtonSize,
              width: switchSongButtonSize,
              minWidth: switchSongButtonSize,
            }}
          >
            <LeftIcon sx={{
              fontSize: layoutInfo.containerHeight * 0.2,
            }}></LeftIcon>
          </IconButton>
          <IconButton onClick={onNextClick} variant="outlined" color="primary" disabled={isPlayingCountdown}
            sx={{
              position: "absolute",
              top: switchSongButtonTop,
              left: nextSongButtonLeft,
              height: switchSongButtonSize,
              width: switchSongButtonSize,
              minWidth: switchSongButtonSize,
            }}
          >
            <RightIcon sx={{
              fontSize: layoutInfo.containerHeight * 0.2,
            }}></RightIcon>
          </IconButton>
        </Box> */}
        {prominents}
      </Box>
    </Box>
    <PlaySlider 
      globalState={globalState}
      globalRefs={globalRefs}
    ></PlaySlider>
    <PlayControls
      onPreviousClick={onPreviousClick}
      onNextClick={onNextClick}
      onPauseClick={onPauseClick}
      globalState={globalState}
    ></PlayControls>
    {audioPlayer}
    <audio ref={audioCountdownRef} src="../Bell3.mp3"></audio>
      
    <Box align="left" width="100%" >
      <Typography className="chinese">队列中 (单击可选择将其跳过)</Typography>
    </Box>
    <QueueCardGroup 
      data={data}
      globalState={globalState}
      containerWidthPixels={layoutInfo.containerWidth}
      globalMethods={globalMethods}
    />

  </Stack>

}