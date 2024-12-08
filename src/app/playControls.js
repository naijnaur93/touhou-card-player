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
import { forwardRef } from "react";
import * as utils from "./utils";
import { useTheme } from "@mui/material/styles";

const PlayControls = ({
  children, onPreviousClick, onNextClick, onPauseClick,
  globalState
}) => {
  const playbackState = globalState.playbackState;
  const isPlayingCountdown = playbackState.playingCountdownTimeout !== null;
  const paused = playbackState.paused || playbackState.playbackPaused;
  return <Stack direction="row" spacing={2} alignItems="center" justifyContent={"center"}> 
    <IconButton onClick={onPreviousClick} variant="outlined" color="primary" disabled={isPlayingCountdown} size="large">
      <LeftIcon fontSize="large"></LeftIcon>
    </IconButton>
    <IconButton disabled={isPlayingCountdown} onClick={onPauseClick} variant="outlined" color="primary" size="large"
    >
      {paused ? <PlayIcon
          fontSize="large"
        ></PlayIcon> : <PauseIcon
          fontSize="large"
        ></PauseIcon>
      }
    </IconButton>
    <IconButton onClick={onNextClick} variant="outlined" color="primary" disabled={isPlayingCountdown} size="large">
      <RightIcon fontSize="large"></RightIcon>
    </IconButton>
    {children}
  </Stack>
}
PlayControls.displayName = "PlayControls";

const PlaySlider = ({
  globalState, globalRefs
}) => {
  
  const toMinuteSeconds = function(t) {
    if (isNaN(t)) {
      return "0:00";
    }
    let minutes = Math.floor(t / 60);
    let seconds = Math.floor(t % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }
  const audioRef = globalRefs.audioRef;
  const audioState = globalState.audioState;
  return <Stack direction="row" spacing={2} alignItems="center" justifyContent={"center"} width={"100%"}>
  <Typography style={{fontFamily: "monospace"}}>
    {toMinuteSeconds(audioState.currentTime)}
  </Typography>
  <Slider sx={{
    width: "clamp(0px, 25%, 240px)"
  }}
    value={audioState.currentTime} 
    max={isNaN(audioState.duration) ? 0 : audioState.duration}
    onChange={(e, newValue) => {
      if (isNaN(newValue)) {
        console.log("NaN")
        return;
      }
      if (audioRef.current) {
        audioRef.current.currentTime = newValue;
      }
    }}
  >
  </Slider>
  <Typography style={{fontFamily: "monospace"}}>
    {toMinuteSeconds(audioState.duration)}
  </Typography>
</Stack>
}
PlaySlider.displayName = "PlaySlider"

export { PlayControls, PlaySlider };