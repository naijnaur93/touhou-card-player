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
import Image from 'next/image';
import useMediaQuery from '@mui/material/useMediaQuery';

const musicFilePrefix = "";

import localFont from "next/font/local";
import { Alert, Collapse, Container, Link } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import getConfig from "next/config";

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

const cardStyleSet = [
  ["dairi-sd", "cards/", 
    <Typography color="gray" key="0">
      Free super-deformed tachies from dairi Twitter <Link href="https://x.com/dairi155">@dairi155</Link>. 
      I decided that some
      characters should look happier than others, and some gloomier.
    </Typography>
  ],
  ["dairi", "cards-dairi/", 
    <Typography color="gray" key="1">
      Free super-deformed tachies from dairi Twitter <Link href="https://x.com/dairi155">@dairi155</Link>. Respect to the very diligent illustrator.
    </Typography>
  ],
  ["enbu", "cards-enbu/", 
    <Typography color="gray" key="2">
      Free tachies from RPG game <Link hrerf="http://www.fo-lens.net/enbu_ap/">幻想人形演舞-ユメノカケラ-</Link>. 
      Well, don&apos;t blame me if some
      characters&apos; head seem greater than others&apos;.
    </Typography>
  ],
  ["enbu-dolls", "cards-enbu-dolls/", 
    <Typography color="gray" key="3">
      Free tachies from RPG game <Link href="http://www.fo-lens.net/enbu_ap/">幻想人形演舞-ユメノカケラ-</Link>. They were intended for the dolls as
      a part of the original game. Cute aren&apos;t they?
    </Typography>
  ],
  ["thwiki-sd", "cards-thwiki/", 
    <Typography color="gray" key="4">
      Art from <Link href="https://thwiki.cc/">thbwiki</Link>. The music here is also linked from their storage so I can host
      this website without renting a server. 
    </Typography>
  ],
  ["zun", "cards-zun/", 
    <Typography color="gray" key="5">
      Well, cheers for those who love ZUN&apos;s art. Who else on earth would use these for playing?
      I don&apos;t have the copyright and should not have used
      these here, but let&apos;s pray no one cares.
    </Typography>
  ],
]

var docCookies = {
  getItem: function (sKey) {
    return (
      decodeURIComponent(
        document.cookie.replace(
          new RegExp(
            "(?:(?:^|.*;)\\s*" +
              encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") +
              "\\s*\\=\\s*([^;]*).*$)|^.*$",
          ),
          "$1",
        ),
      ) || null
    );
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
      return false;
    }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires =
            vEnd === Infinity
              ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT"
              : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
          break;
      }
    }
    document.cookie =
      encodeURIComponent(sKey) +
      "=" +
      encodeURIComponent(sValue) +
      sExpires +
      (sDomain ? "; domain=" + sDomain : "") +
      (sPath ? "; path=" + sPath : "") +
      (bSecure ? "; secure" : "") +
      "; SameSite=None; Secure";
    return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
    if (!sKey || !this.hasItem(sKey)) {
      return false;
    }
    document.cookie =
      encodeURIComponent(sKey) +
      "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" +
      (sDomain ? "; domain=" + sDomain : "") +
      (sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function (sKey) {
    return new RegExp(
      "(?:^|;\\s*)" +
        encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") +
        "\\s*\\=",
    ).test(document.cookie);
  }
};

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
  const [musicSources, setMusicSources] = useState({});
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
  const [alertInfo, setAlertInfo] = useState({
    "disappearTimeout": null,
    "message": "",
  })
  const [cardFilePrefix, setCardFilePrefix] = useState("./cards/");

  const theme = useTheme();

  function recordCookie(playOrder, musicIds, currentPlayingId) {
    // create a list of characters for indexing
    let characters = [];
    for (let key in data) {
      characters.push(key);
    }
    // record number of characters
    docCookies.setItem("numCharacters", characters.length, Infinity);

    // record playOrder
    if (playOrder !== null) {
      let playOrderIdsInData = [];
      playOrder.forEach((character) => {
        // find the index of character in characters
        let index = -1;
        for (let i = 0; i < characters.length; i++) {
          if (characters[i] === character) {
            index = i;
            break;
          }
        }
        if (index !== -1) {
          playOrderIdsInData.push(index);
        }
      });
      docCookies.setItem("playOrder", playOrderIdsInData.join(","), Infinity);
    }

    // record musicIds
    if (musicIds !== null) {
      let musicIdsList = [];
      for (let i = 0; i < characters.length; i++) {
        let character = characters[i];
        let musicId = musicIds[character];
        musicIdsList.push(musicId);
      }
      docCookies.setItem("musicIds", musicIdsList.join(","), Infinity);
    }

    // record nowplaying
    if (currentPlayingId !== null) {
      let nowPlayingIndex = -1;
      for (let i = 0; i < characters.length; i++) {
        if (characters[i] === currentPlayingId) {
          nowPlayingIndex = i;
          break;
        }
      }
      docCookies.setItem("currentPlayingId", nowPlayingIndex, Infinity);
    }
  }


  function showAlert(message) {
    if (alertInfo.disappearTimeout !== null) {
      clearTimeout(alertInfo.disappearTimeout);
    }
    setAlertInfo({
      "disappearTimeout": setTimeout(() => {
        setAlertInfo({
          "disappearTimeout": null,
          "message": "",
        })
      }, 3000),
      "message": message,
    })
  }
  
  // game states
  const [gameLayout, setGameLayout] = useState({
    "hasOpponent": false,
    "columns": 10,
    "rows": 3,
    "opponent": [], // each item is (character, cardId)
    "player": [],
    "deckWidthPercentage": 70,
    "giveAtMistake": true,
  })
  const [localRows, setLocalRows] = useState(gameLayout.rows);
  const [localColumns, setLocalColumns] = useState(gameLayout.columns);
  const [localDeckWidthPercentage, setLocalDeckWidthPercentage] = useState(gameLayout.deckWidthPercentage);
  const [gameStats, setGameStats] = useState({
    "started": false,
    "opponentPicked": [],
    "playerPicked": [],
    "opponentObtained": [],
    "playerObtained": [],
    "mistaken": {
      "opponent": [],
      "player": [],
    },
    "correctFoundBy": 0, // 0: none, 1: player, 2: opponent
  })
  const [gameOpponentClickTimeout, setGameOpponentClickTimeout] = useState(null);
  const [gameOpponentProperties, setGameOpponentProperties] = useState({
    "average": 8,
    "mistakeRate": 0.2,
    "slowRate": 0.2,
    "fastRate": 0.2,
  })
  const [gamePlayerStats, setGamePlayerStats] = useState({
    "allAccumulateTime": 0,
    "correctAccumulateTime": 0,
    "allClicks": 0,
    "correctClicks": 0,
  })
  const [gameRoundStartTimestamp, setGameRoundStartTimestamp] = useState(0);
  const [temporarySkip, setTemporarySkip] = useState({})

  const audioPlayerRef = useRef(null);
  const countdownPlayerRef = useRef(null);
  const gameStatsRef = useRef(gameStats);
  const gameLayoutRef = useRef(gameLayout);
  const gameOpponentPropertiesRef = useRef(gameOpponentProperties);
  
  const isSmallScreen = !useMediaQuery("(min-width:600px)");

  function finishCurrentRound() {
    if (setGameOpponentClickTimeout !== null) {
      clearTimeout(gameOpponentClickTimeout);
      setGameOpponentClickTimeout(null);
    }
    let newGameStats = {...gameStats};
    // check if current playing id is in the decks
    let foundInPlayer = false;
    let foundInOpponent = false;
    for (let i = 0; i < gameLayout.player.length; i++) {
      if (gameLayout.player[i][0] === currentPlayingId && !gameStats.playerPicked[i]) {
        foundInPlayer = true;
        newGameStats.playerPicked[i] = true;
        if (gameStats.correctFoundBy === 1) {
          newGameStats.playerObtained.push(gameLayout.player[i]);
        } else if (gameStats.correctFoundBy === 2) {
          newGameStats.opponentObtained.push(gameLayout.player[i]);
        } else {
          if (!gameLayout.hasOpponent) {
            setGamePlayerStats({
              ...gamePlayerStats,
              "allClicks": gamePlayerStats.allClicks + 1,
              "allAccumulateTime": gamePlayerStats.allAccumulateTime + (Date.now() - gameRoundStartTimestamp),
            })
          }
        }
      }
    }
    for (let i = 0; i < gameLayout.opponent.length; i++) {
      if (gameLayout.opponent[i][0] === currentPlayingId && !gameStats.opponentPicked[i]) {
        foundInOpponent = true;
        newGameStats.opponentPicked[i] = true;
        if (gameStats.correctFoundBy === 1) {
          newGameStats.playerObtained.push(gameLayout.opponent[i]);
        } else if (gameStats.correctFoundBy === 2) {
          newGameStats.opponentObtained.push(gameLayout.opponent[i]);
        } else {
          if (!gameLayout.hasOpponent) {
            setGamePlayerStats({
              ...gamePlayerStats,
              "allClicks": gamePlayerStats.allClicks + 1,
              "allAccumulateTime": gamePlayerStats.allAccumulateTime + (Date.now() - gameRoundStartTimestamp),
            })
          }
        }
      }
    }
    if (gameLayout.hasOpponent) {
      // to give or receive cards
      let playerGive = gameStats.mistaken.opponent.length - gameStats.mistaken.player.length;
      if (foundInPlayer && gameStats.correctFoundBy === 2) {playerGive -= 1;}
      if (foundInOpponent && gameStats.correctFoundBy === 1) {playerGive += 1;}
      if (!gameLayout.giveAtMistake) {playerGive = 0;}
      // console.log("summing up ......................")
      // console.log("opponentMistake", gameStats.mistaken.opponent.length, "playerMistake", gameStats.mistaken.player.length);
      // console.log("foundInPlayer", foundInPlayer, "foundInOpponent", foundInOpponent);
      // console.log("correctFoundBy", gameStats.correctFoundBy);
      // console.log("playerGive", playerGive);
      if (playerGive != 0) {
        let playerDeck = gameLayout.player.slice();
        let playerEmpties = [];
        let playerAvailables = [];
        let opponentDeck = gameLayout.opponent.slice();
        let opponentEmpties = [];
        let opponentAvailables = [];
        for (let i = 0; i < playerDeck.length; i++) {
          if (newGameStats.playerPicked[i]) {
            playerEmpties.push(i);
          } else {
            playerAvailables.push(i);
          }
        }
        for (let i = 0; i < opponentDeck.length; i++) {
          if (newGameStats.opponentPicked[i]) {
            opponentEmpties.push(i);
          } else {
            opponentAvailables.push(i);
          }
        }
        
        // console.log("foundInPlayer", foundInPlayer, "foundInOpponent", foundInOpponent);
        // console.log("playerEmpties", playerEmpties);
        // console.log("playerAvailables", playerAvailables);
        // console.log("opponentEmpties", opponentEmpties);
        // console.log("opponentAvailables", opponentAvailables);
        // console.log("playerDeck", playerDeck);
        // console.log("opponentDeck", opponentDeck);

        while (playerGive > 0 && opponentEmpties.length > 0 && playerAvailables.length > 0) {
          let giveId = Math.floor(Math.random() * playerAvailables.length);
          let receiveId = Math.floor(Math.random() * opponentEmpties.length);
          let giveIndex = playerAvailables[giveId];
          let receiveIndex = opponentEmpties[receiveId];
          opponentDeck[receiveIndex] = playerDeck[giveIndex];
          newGameStats.playerPicked[giveIndex] = true;
          newGameStats.opponentPicked[receiveIndex] = false;
          playerGive -= 1;
          playerAvailables.splice(giveId, 1);
          opponentEmpties.splice(receiveId, 1);
        }
        while (playerGive < 0 && playerEmpties.length > 0 && opponentAvailables.length > 0) {
          let giveId = Math.floor(Math.random() * opponentAvailables.length);
          let receiveId = Math.floor(Math.random() * playerEmpties.length);
          let giveIndex = opponentAvailables[giveId];
          let receiveIndex = playerEmpties[receiveId];
          playerDeck[receiveIndex] = opponentDeck[giveIndex];
          newGameStats.opponentPicked[giveIndex] = true;
          newGameStats.playerPicked[receiveIndex] = false;
          playerGive += 1;
          opponentAvailables.splice(giveId, 1);
          playerEmpties.splice(receiveId, 1);
        }
        setGameLayout({
          ...gameLayout,
          "player": playerDeck,
          "opponent": opponentDeck,
        })
      }
    }
    setGameStats({
      ...newGameStats,
      "mistaken": {
        "opponent": [],
        "player": [],
      },
      "correctFoundBy": 0,
    })
  }

  useEffect(() => {
    gameStatsRef.current = gameStats;
    gameLayoutRef.current = gameLayout;
    gameOpponentPropertiesRef.current = gameOpponentProperties;
  }, [gameStats, gameLayout, gameOpponentProperties]);


  useEffect(() => {
    if (audioPlayerRef.current === null) return;
    audioPlayerRef.current.load();
  }, [currentPlayingId]);

  function gameFinished() {
    let isPlayerFinished = true;
    for (let i = 0; i < gameLayoutRef.current.player.length; i++) {
      if (!gameStatsRef.current.playerPicked[i]) {
        isPlayerFinished = false;
      }
    }
    let isOpponentFinished = gameLayoutRef.current.hasOpponent;
    for (let i = 0; i < gameLayoutRef.current.opponent.length; i++) {
      if (!gameStatsRef.current.opponentPicked[i]) {
        isOpponentFinished = false;
      }
    }
    if (gameLayoutRef.current.hasOpponent) {
      if (gameLayoutRef.current.giveAtMistake) {
        return isPlayerFinished || isOpponentFinished
      } else {
        return isPlayerFinished && isOpponentFinished
      }
    } else {
      return isPlayerFinished
    }
  }

  function opponentClick(currentPlayingId) {
    if (setGameOpponentClickTimeout !== null) {
      clearTimeout(gameOpponentClickTimeout);
      setGameOpponentClickTimeout(null);
    }
    // if player has already found, return
    if (gameStatsRef.current.correctFoundBy !== 0) {
      console.log("opponent later than player")
      return;
    }
    // if game is finished return
    if (gameFinished()) {return;}
    let mistakeRandom = Math.random();
    let mistake = mistakeRandom < gameOpponentPropertiesRef.current.mistakeRate;
    console.log("mistake random", mistakeRandom, " rate", gameOpponentPropertiesRef.current.mistakeRate);
    // console.log("currentPlayingId", currentPlayingId);
    if (!mistake) {
      let found = false;
      for (let i = 0; i < gameLayoutRef.current.player.length; i++) {
        if (gameLayoutRef.current.player[i][0] === currentPlayingId && !gameStatsRef.current.playerPicked[i]) {
          found = true;
        }
      }
      for (let i = 0; i < gameLayoutRef.current.opponent.length; i++) {
        if (gameLayoutRef.current.opponent[i][0] === currentPlayingId && !gameStatsRef.current.opponentPicked[i]) {
          found = true;
        }
      }
      if (found) {
        console.log("opponent found correct");
        setGameStats({
          ...gameStatsRef.current,
          "correctFoundBy": 2,
        })
      } else {
        console.log("opponent found nothing");
      }
    } else {
      // find any card that is not correct
      let available = []
      for (let i = 0; i < gameLayoutRef.current.opponent.length; i++) {
        if (!gameStatsRef.current.opponentPicked[i] && gameLayoutRef.current.opponent[i][0] !== currentPlayingId) {
          available.push(gameLayoutRef.current.opponent[i][0]);
        }
      }
      for (let i = 0; i < gameLayoutRef.current.player.length; i++) {
        if (!gameStatsRef.current.playerPicked[i] && gameLayoutRef.current.player[i][0] !== currentPlayingId) {
          available.push(gameLayoutRef.current.player[i][0]);
        }
      }
      if (available.length === 0) {
        return;
      }
      let randomIndex = Math.floor(Math.random() * available.length);
      let randomCharacter = available[randomIndex];
      let mistaken = [];
      if (gameStatsRef.current.mistaken.player.indexOf(randomCharacter) === -1) {
        mistaken.push(randomCharacter);
      }
      console.log("opponent mistaken", mistaken);
      setGameStats({
        ...gameStatsRef.current,
        "mistaken": {
          ...gameStatsRef.current.mistaken,
          "opponent": mistaken,
        },
      })
    }
  }

  function createOpponentClickTimeout(correctId) {
    
    if (!(gameSimulatorEnabled && gameStats.started && gameLayout.hasOpponent)) {
      return;
    }

    if (setGameOpponentClickTimeout !== null) {
      clearTimeout(gameOpponentClickTimeout);
      setGameOpponentClickTimeout(null);
    }
    let time = gameOpponentProperties.average * 1000;
    let random = Math.random();
    if (random < gameOpponentProperties.slowRate) {
      time *= 2;
    } else if (random < gameOpponentProperties.slowRate + gameOpponentProperties.fastRate) {
      time *= 0.3;
    } else {
      let ratio = Math.random() * 0.6 + 0.7;
      time *= ratio;
    }
    console.log("opponent click in", time, "ms");
    let timeout = setTimeout(opponentClick, time, correctId);
    setGameOpponentClickTimeout(timeout);
  }

  function playNextMusic() {
    
    // find the index of the currentPlayingId in playOrder
    let index = playOrder.indexOf(currentPlayingId);
    // if the currentPlayingId is not in playOrder
    if (index === -1) {
      index = 0;
    }
    index = (index + 1) % playOrder.length;
    while (musicIds[playOrder[index]] === -1 || temporarySkip[playOrder[index]]) {
      index = (index + 1) % playOrder.length;
    }

    setCurrentPlayingId(playOrder[index]);
    recordCookie(null, null, playOrder[index]);

    if (gameSimulatorEnabled) {
      setGameRoundStartTimestamp(Date.now());
    }

    if (haveInput) {
      createOpponentClickTimeout(playOrder[index]);
    }
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
    // find the index of the currentPlayingId in playOrder
    let index = playOrder.indexOf(currentPlayingId);
    index = (index - 1 + playOrder.length) % playOrder.length;
    while (musicIds[playOrder[index]] === -1 || temporarySkip[playOrder[index]]) {
      index = (index - 1 + playOrder.length) % playOrder.length;
    }
    setCurrentPlayingId(playOrder[index]);
    recordCookie(null, null, playOrder[index]);
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

  function getMusicName(character, musicId, withAlbum = false, albumNameInList = false) {
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
      if (albumNameInList) {
        return [musicName, albumName];
      }
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
    // if musicUrl is in the musicSources dict keys, use it
    if (musicSources[musicUrl] !== undefined) {
      return musicSources[musicUrl];
    }
    return "./music/" + musicFilePrefix + musicUrl;
  }

  function reroll(ordered = false) {
    setHaveInput(false);
    let ids = []
    Object.entries(data).forEach(([character, value]) => {
      ids.push(character);
    });
    // permute the ids
    let permuted = (ordered) ? (ids) : randomlyPermutePlayOrder(ids);
    setPlayOrder(permuted);
    // set new temporary skip to have all falses
    let newTemporarySkip = {};
    Object.entries(data).forEach(([character, value]) => {
      newTemporarySkip[character] = false;
    })
    setTemporarySkip(newTemporarySkip);
    let first = 0;
    while (musicIds[permuted[first]] === -1) {
      first = (first + 1) % permuted.length;
    }
    if (ids.length > 0) {
      setCurrentPlayingId(permuted[first]);
      recordCookie(permuted, null, permuted[first]);
      // force audio reload
      audioPlayerRef.current.load();
    } else {
      recordCookie(permuted, null, null);
    }
  }

  function renderCurrentPlaying() {
    let character = currentPlayingId;
    let musicId = musicIds[character];
    let [musicName, albumName] = getMusicName(character, musicId, true, true);
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
        <Paper key={card} variant="outlined"
          sx={{
            backgroundColor: "white",
            width: "30%",
          }}>
          <Box sx={{position: "relative", paddingTop: "142.25%", justifyContent: "center", alignItems: "center"}}>
            <img key={card} 
              src={cardFilePrefix + card} 
              alt={card}
              style={{
                width: "100%", 
                height: "auto", 
                position: "absolute", 
                left: 0,
                objectFit: "cover",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          </Box>
        </Paper>
      );
    }

    let queued = [];
    let beforeCurrent = true;
    let allCardCount = 0
    playOrder.forEach((character, index) => {
      let cards = data[character]["card"];
      if (typeof cards === 'string') {
        cards = [cards];
      }
      allCardCount += cards.length
    })
    playOrder.forEach((character, index) => {
      if (character == currentPlayingId) {beforeCurrent = false; return;}
      if (musicIds[character] === -1) {return;}
      if (beforeCurrent) {return;}
      let cards = data[character]["card"];
      if (typeof cards === 'string') {
        cards = [cards];
      }
      cards.forEach((cardName, cardId) => {
        let marginLeft = (queued.length !== 0) ? "-2%" : "0"
        if (cardId !== 0) {
          marginLeft = "-10%"
        }
        queued.push(<Paper key={"" + index + cardId} variant="elevation" elevation={6}
          sx={{
            backgroundColor: temporarySkip[character] ? "lightgray" : "white", 
            flex: "0 0 16.7%",
            marginLeft: marginLeft,
            zIndex: allCardCount,
            cursor: "pointer",
            "&:hover": {
              backgroundColor: temporarySkip[character] ? "#DAEBEB" : "lightcyan", 
            }
          }}
          onClick={() => {
            let newSkip = {...temporarySkip};
            newSkip[character] = !newSkip[character];
            setTemporarySkip(newSkip);
          }}
          >
          <Box sx={{position: "relative", paddingTop: "142.25%", justifyContent: "center", alignItems: "center"}}>
            <img key={"" + index} 
              src={cardFilePrefix + cardName} 
              alt={cardName}
              style={{
                width: "100%", 
                height: "auto", 
                position: "absolute", 
                left: 0,
                objectFit: "cover",
                top: "50%",
                transform: "translateY(-50%)",
                filter: temporarySkip[character] ? "grayscale(100%)" : "none",
              }}
            />
          </Box>
        </Paper>)
        allCardCount -= 1
      })
    })

    const cardAspectRatio = (1000 / 703) * 100 + "%";
    let dummyElement = <Box key="dummy" sx={{ flex: "0 0 " + "16.7%" }}>
    <Paper key="dummy" variant="elevation" elevation={0}
      sx={{ backgroundColor: "transparent", width: "100%", position: "relative", paddingTop: cardAspectRatio, overflow: "hidden",
      }}>
      <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%"
      }}>
      </Box>
    </Paper>
  </Box>
    
    return (
      <Box padding={2} align="center">
        <Typography sx={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "clamp(1em, 1.5em, 3vw)"}}>{musicName}</Typography>
        <Typography sx={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "clamp(0.8em, 1.2em, 2.4vw)"}}>{albumName}</Typography>
        <Typography sx={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "clamp(0.8em, 1.2em, 2.4vw)"}}>{character}</Typography>
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
        <Stack direction="row" spacing={1} padding={1} alignItems="center" justifyContent={"center"}>
          <Button onClick={previousMusic} variant="outlined" width="100" className="chinese" size="small">上一曲</Button>
          <Button onClick={() => {
            let audio = audioPlayerRef.current;
            if (audio.paused) {
              setHaveInput(true);
              audio.play();
            } else {
              setHaveInput(false);
              audio.pause();
            }
          }} variant="outlined" width="100" className="chinese" size="small">播放|暂停</Button>
          <Button onClick={nextMusic} variant="outlined" width="100" className="chinese" size="small">下一曲</Button>
        </Stack>
        <Stack direction="row" spacing={1}  padding={0} alignItems="center" justifyContent={"center"}>
          <Button onClick={() => {reroll(false);}} variant="outlined" color="warning" size="small" width="100" className="chinese">
            重新抽选
          </Button>
          <Button onClick={() => {reroll(true);}} variant="outlined" color="warning" size="small" width="100" className="chinese">
            顺序排列
          </Button>
        </Stack>
        <Grid container paddingTop={1} alignItems="center" justifyContent={"center"}>
          <Grid item xs={4}>
            <TextField id="playLengthTextField" label="播放时长（0 = 无限）" variant="standard" size="small"
              className="chinese"
              value={playLength} 
              onChange={(event) => setPlayLength(parseFloat(event.target.value))}
              type="number"
              sx={{width: "80%"}}
              // min is 0, max is 180, step is 0.25
              inputProps={{min: 0, max: 180, step: 0.25}}
            />
          </Grid>
          <Grid item xs={4} className="chinese">
            <CheckBox
              checked={isRandomStart}
              onChange={(event) => setIsRandomStart(event.target.checked)}
              inputProps={{ 'aria-label': 'controlled' }}
              size="small"
            />
            <Typography variant="button">随机位置</Typography>
          </Grid>
          <Grid item xs={4} className="chinese">
            <CheckBox
              checked={playCountdown}
              onChange={(event) => setPlayCountdown(event.target.checked)}
              inputProps={{ 'aria-label': 'controlled' }}
              size="small"
            />
            <Typography variant="button">倒计时</Typography>
          </Grid>
        </Grid>
        <Box align="left" paddingTop={1}>
          <Typography className="chinese">队列中 (单击可选择将其跳过)</Typography>
        </Box>
        <Stack key={"queuedStack"} 
          direction={"row"}
          width="100%"
          justifyContent={"flex-start"}
          sx={{
            paddingTop: 1,
            overflowX: "visible",
            whiteSpace: "nowrap", overflow: "auto", display: "flex", flexWrap: "nowrap"
          }}
          
        >
          {queued.length == 0 && <Typography className="chinese">(空)</Typography>}
          {queued.length == 0 && dummyElement}
          {queued}
        </Stack>
      </Box>
    );
  }

  function renderPlayList() {
    let items = []
    for (let i = 0; i < playOrder.length; i++) {
      let character = playOrder[i];
      let musicId = musicIds[character];
      if (musicId !== -1) {
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
            cursor: temporarySkip[character] ? "default" : "pointer",
            color: temporarySkip[character] ? "gray" : "white",
          }}
            onClick={temporarySkip[character] ? null : (() => {
              setCurrentPlayingId(character)
              recordCookie(null, null, character);
              // force audio reload
              audioPlayerRef.current.load();
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
    }}>{items}</List>;
  }

  function renderMusicIdSelector() {
    let selectors = []
    let presets = []
    Object.entries(idPresets).forEach(([presetName, presetData]) => {
      let isUsed = 0; // 0 - not used, 1 - partially used, 2 - fully used
      let usedCount = 0;
      for (let key in presetData) {
        if (presetData[key] === musicIds[key]) {
          usedCount += 1;
        }
      }
      if (usedCount === Object.keys(presetData).length) {
        isUsed = 2;
      } else if (usedCount > 0) {
        isUsed = 1;
      }
      let buttonGroupColor = "primary"
      if (isUsed === 1) {
        buttonGroupColor = "success"
      } else if (isUsed === 2) {
        buttonGroupColor = "warning"
      }
      presets.push(
        <Box margin={0.5} key={presetName}>
          <ButtonGroup variant="outlined" key={presetName} aria-label="Basic button group" color={buttonGroupColor} size="small">
            <Button key={presetName} onClick={() => {
              let newMusicIds = {}
              for (let key in musicIds) {
                newMusicIds[key] = musicIds[key];
              }
              for (let key in presetData) {
                newMusicIds[key] = presetData[key];
              }
              setMusicIds(newMusicIds);
              recordCookie(null, newMusicIds, null);
              setIdPresetHelp(presetName);
              // if currentPlayingId is in the preset
              if (currentPlayingId in presetData) {
                // if it is not -1, reload the audio
                if (presetData[currentPlayingId] === -1) {
                  let index = (playOrder.indexOf(currentPlayingId) + 1) % playOrder.length;
                  while (newMusicIds[playOrder[index]] === -1 || temporarySkip[playOrder[index]]) {
                    index = (index + 1) % playOrder.length;
                  }
                  setCurrentPlayingId(playOrder[index]);
                  recordCookie(null, null, playOrder[index]);
                }
              }
            }} variant="outlined" width="100" className="chinese">{presetName}</Button>
            <Button key={presetName + "Help"} variant={idPresetHelp === presetName ? "contained" : "outlined"}
              onClick={() => setIdPresetHelp(idPresetHelp === presetName ? null : presetName)} 
              className="chinese"
            >?</Button>
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
              recordCookie(null, newMusicIds, null);
              if (currentPlayingId === character && newMusicIds[character] === -1) {
                let index = (playOrder.indexOf(character) + 1) % playOrder.length;
                while (newMusicIds[playOrder[index]] === -1 || temporarySkip[playOrder[index]]) {
                  index = (index + 1) % playOrder.length;
                }
                setCurrentPlayingId(playOrder[index]);
                recordCookie(null, null, playOrder[index]);
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
        <Typography variant="h6" className="chinese">卡牌风格</Typography>
          <Stack spacing={0}>
            <FormControl>
              <RadioGroup 
                row
                key="cardStyle" 
                variant="outlined"
                value={cardFilePrefix} 
                onChange={(event) => {
                  let newMusicIds = {}
                  for (let key in musicIds) {
                    newMusicIds[key] = musicIds[key];
                  }
                  setCardFilePrefix(event.target.value);
                  docCookies.setItem("cardFilePrefix", event.target.value, Infinity, "/");
                }}
              >
                {
                  cardStyleSet.map((style, index) => {
                    return <FormControlLabel 
                      key={index} 
                      value={style[1]}
                      control={<Radio />} 
                      label={style[0]}
                      size="small"
                      sx={{
                        height: "1.5em",
                      }}
                    />
                  })
                }
              </RadioGroup>
            </FormControl>
            <Box paddingTop={-2}>
              {
                cardStyleSet.map((style, index) => {
                  if (style[1] === cardFilePrefix) {
                    return style[2]
                  }
                })
              }
            </Box>
          </Stack>

          <Typography variant="h6" className="chinese">曲目预设选择</Typography>
          <Typography color="gray" key="0" className="chinese">
            <Typography style={{color: theme.palette.warning.light }} display="inline">橙色表示已完全应用。</Typography>
            <Typography style={{color: theme.palette.success.light }} display="inline">绿色表示部分应用。</Typography>
            <Typography style={{color: theme.palette.primary.light }} display="inline">蓝色表示未应用。</Typography>
          </Typography>
          <Grid container spacing={2}>
            {presets}
          </Grid>
          {idPresetHelpText}
          <Typography variant="h6" className="chinese">单曲选择</Typography>
          {selectors}
        </Stack>
      </Box>
    )
  }

  function renderAllMusicPlayer() {
    return (
      <Grid container spacing={2} padding={0}>
        
        <div display="none">
          <audio ref={countdownPlayerRef}>
            <source src="./Bell3.mp3" type="audio/mpeg" />
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

    let cardSelector = []
    let totalCount = gameLayout.columns * gameLayout.rows;
    
    // return 
    //   0: nothing, because already selected by opponent, 
    //      or select by self with another cardId of the same character,
    //      or is disabled in the music list
    //   1: can add to self deck, 2: can remove from self deck
    let selectOption = function(character, cardId, gameLayout) {

      if (musicIds[character] === -1) {
        return 0;
      }

      // check if the card is already selected by opponent
      for (let i = 0; i < gameLayout.opponent.length; i++) {
        if (gameLayout.opponent[i][0] === character) {
          return 0;
        }
      }
      // check if the card is already selected by player
      for (let i = 0; i < gameLayout.player.length; i++) {
        if (gameLayout.player[i][0] === character) {
          if (gameLayout.player[i][1] === cardId) {
            return 2;
          }
          return 0;
        }
      }
      return 1;
    }

    Object.entries(data).forEach(([character, value], index) => {
      let cardList = value["card"];
      if (typeof cardList === 'string') {
        cardList = [cardList];
      }
      cardList.forEach((card, index) => {
        let option = selectOption(character, index, gameLayout);
        if (option === 0) {return;}
        if (option === 1 && gameLayout.player.length >= totalCount) {return;}
        cardSelector.push(
          <Box key={character + index} sx={{ 
            flex: {
              sm: "0 0 10%",
              xs: "0 0 30%",
            }
          }} padding={0}>
            <Button key={character + index} variant="outlined" size="small"
              sx={{
                margin: 0,
                spacing: 0,
                width: "100%",
              }}
              color={option === 1 ? "primary" : "error"}
              onClick={() => {
                if (option === 1) {
                  setGameLayout({...gameLayout, "player": [...gameLayout.player, [character, index]]})
                } else if (option === 2) {
                  let newPlayer = []
                  for (let i = 0; i < gameLayout.player.length; i++) {
                    if (gameLayout.player[i][0] === character && gameLayout.player[i][1] === index) {
                      continue;
                    }
                    newPlayer.push(gameLayout.player[i]);
                  }
                  setGameLayout({...gameLayout, "player": newPlayer})
                }
              }}
            >
              <Stack key={character + index} alignItems="center" justifyContent={"center"} sx={{width: "100%"}}>
                <Paper key={character + index} variant="outlined"
                  sx={{
                    backgroundColor: {1: "cornflowerblue", 2: "lightsalmon"}[option],
                    width: "100%",
                  }}>
                  <Box sx={{
                    width: "100%", 
                    position: "relative", 
                    paddingTop: "142.25%", 
                    justifyContent: "center", alignItems: "center"
                  }}>
                    <img key={character + index} 
                      src={cardFilePrefix + card} 
                      alt={card}
                      style={{
                        width: "100%", 
                        height: "auto", 
                        position: "absolute", 
                        top: 0,
                        left: 0,
                        objectFit: "cover",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    />
                  </Box>
                </Paper>
                {option === 1 ? 
                  <Typography variant="body2" className="chinese">添加</Typography> :
                  <Typography variant="body2" className="chinese">移除</Typography>
                }
              </Stack>
            </Button>
          </Box>
        )
      })
    })

    let deckClick = function(isOpponent, index) {
      if (!gameStats.started) {return;}
      if (gameStats.correctFoundBy !== 0) {return;}
      let cardInfo = isOpponent ? gameLayout.opponent[index] : gameLayout.player[index];
      cardInfo = [cardInfo[0], cardInfo[1]];
      let newGameStats = {...gameStats};
      let newPlayerStats = {...gamePlayerStats};
      let clickedCharacter = cardInfo[0];
      newPlayerStats.allClicks += 1;
      newPlayerStats.allAccumulateTime += Date.now() - gameRoundStartTimestamp;
      if (clickedCharacter === currentPlayingId) {
        newGameStats.correctFoundBy = 1;
        newPlayerStats.correctClicks += 1;
        newPlayerStats.correctAccumulateTime += Date.now() - gameRoundStartTimestamp;
      } else {
        if (newGameStats.mistaken.player.indexOf(cardInfo[0]) === -1) {
          newGameStats.mistaken.player.push(cardInfo[0]);
        }
      }
      setGameStats(newGameStats);
      setGamePlayerStats(newPlayerStats);
    }

    // deck list of (character, cardId), picked list of bool, isOpponent bool
    let renderDeck = function(deck, picked, isOpponent) {
      const cardAspectRatio = (1000 / 703) * 100 + "%";
      let rows = []
      let widthPercentage = (gameLayout.deckWidthPercentage / gameLayout.columns) + "%";
      for (let i = 0; i < deck.length; i += gameLayout.columns) {
        let endIndex = Math.min(i + gameLayout.columns, deck.length);
        let rowItems = []
        for (let j = i; j < endIndex; j++) {
          let [character, cardId] = deck[j];
          let cards = data[character]["card"];
          if (typeof cards === 'string') {
            cards = [cards];
          }
          let cardName = cards[cardId];
          let visible = (j >= picked.length || picked[j] === false);
          let background = "white";
          let mistaken = (
            gameStats.mistaken.opponent.indexOf(character) !== -1 || 
            gameStats.mistaken.player.indexOf(character) !== -1
          );
          if (mistaken) {
            background = "lightsalmon"
          }
          if (gameStats.correctFoundBy !== 0) {
            if (character === currentPlayingId) {
              background = "lightgreen";
            }
          }
          let key = character + cardId + j;
          rowItems.push(
            <Box key={key} sx={{ flex: "0 0 " + widthPercentage }}>
              <Paper key={key} variant="elevation" elevation={0}
                onClick={() => deckClick(isOpponent, j)}
                sx={{
                  backgroundColor: visible ? background : "transparent",
                  width: "100%",
                  position: "relative",
                  paddingTop: cardAspectRatio,
                  overflow: "hidden",
                }}>
                <Box sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%"
                }}>
                  {visible && <Box sx={{
                    position: "relative", paddingTop: "142.25%", 
                    justifyContent: "center", alignItems: "center",
                    transform: isOpponent ? "rotate(180deg)" : "rotate(0deg)"
                  }}>
                    <img key={key} 
                    src={cardFilePrefix + cardName} 
                    alt={cardName}
                    style={{
                      width: "100%", 
                      height: "auto", 
                      position: "absolute", 
                      left: 0,
                      objectFit: "cover",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  /></Box>}
                </Box>
              </Paper>
            </Box>
          )
        }
        rows.push(
          <Stack key={i} direction="row" spacing={1} alignItems="center" justifyContent={"center"}>
            {rowItems}
          </Stack>
        )
      }
      return <Stack key={isOpponent} spacing={1} padding={1}>
        {rows}
      </Stack>
    }

    let renderObtained = function(obtained, isOpponent) {
      let cardAspectRatio = (1000 / 703) * 100 + "%";
      let countText = <Typography variant="h3" sx={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        paddingX: 2,
      }}>
        {obtained.length}
      </Typography>
      let widthPercentage = (gameLayout.deckWidthPercentage / gameLayout.columns) + "%";
      let overlapPercentage = (gameLayout.deckWidthPercentage / gameLayout.columns * 2 / 3) + "%";
      let dummyCardName = data[Object.keys(data)[0]]["card"];
      if (typeof dummyCardName === 'string') {
        dummyCardName = dummyCardName;
      } else {
        dummyCardName = dummyCardName[0];
      }
      let dummyElement = <Box key="dummy" sx={{ flex: "0 0 " + widthPercentage }}>
        <Paper key="dummy" variant="elevation" elevation={0}
          sx={{ backgroundColor: "transparent", width: "100%", position: "relative", paddingTop: cardAspectRatio, overflow: "hidden",
          }}>
          <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%"
          }}>
            {false && <img key={key} 
              src={cardFilePrefix + dummyCardName} 
              alt={dummyCardName}
              style={{
                width: "100%", height: "auto",
              }}
            />}
          </Box>
        </Paper>
      </Box>

      let playerStats = <></>
      if (!isOpponent) {
        let correctRate = (gamePlayerStats.allClicks == 0) ? 0 : gamePlayerStats.correctClicks / gamePlayerStats.allClicks;
        // get xx.xx% percent with 2 decimal places
        correctRate = Math.round(correctRate * 10000) / 100;
        correctRate = correctRate.toFixed(2);
        let averageTime = (gamePlayerStats.allClicks == 0) ? 0 : gamePlayerStats.allAccumulateTime / gamePlayerStats.allClicks;
        // get "x.xxx s" with 3 decimal places
        averageTime = (averageTime / 1000).toFixed(3) + " 秒";
        let correctTime = (gamePlayerStats.correctClicks == 0) ? 0 : gamePlayerStats.correctAccumulateTime / gamePlayerStats.correctClicks;
        // get "x.xxx s" with 3 decimal places
        correctTime = (correctTime / 1000).toFixed(3) + " 秒";
        playerStats = <Stack direction={{
          xs: "column", sm: "row"
        }} spacing={1} padding={1} flexWrap="wrap" useFlexGap justifyContent="flex-end" alignItems="flex-end">
          <Divider orientation="vertical" flexItem xs={{display: {xs: "none", sm: "block"}}} />
          <Typography variant="h6" className="chinese">正确率: {gamePlayerStats.correctClicks} / {gamePlayerStats.allClicks} = {correctRate}%</Typography>
          <Divider orientation="vertical" flexItem xs={{display: {xs: "none", sm: "block"}}} />
          <Typography variant="h6" className="chinese">总平均响应: {averageTime}</Typography>
          <Divider orientation="vertical" flexItem xs={{display: {xs: "none", sm: "block"}}} />
          <Typography variant="h6" className="chinese">正确平均响应: {correctTime}</Typography>
          <Divider orientation="vertical" flexItem xs={{display: {xs: "none", sm: "block"}}} />
        </Stack>
      }

      let renderedCards = []
      obtained.forEach((cardInfo, index) => {
        let [character, cardId] = cardInfo;
        let cards = data[character]["card"];
        if (typeof cards === 'string') {
          cards = [cards];
        }
        let cardName = cards[cardId];
        renderedCards.push(<Paper key={"" + renderedCards.length} variant="elevation" elevation={6}
          sx={{
            backgroundColor: "white",
            width: widthPercentage,
            zIndex: index,
            flexShrink: 0,
            '&:hover': {
              zIndex: 1000,
            }
          }}
          >
            <Box sx={{position: "relative", paddingTop: "142.25%", justifyContent: "center", alignItems: "center", transform: isOpponent ? "rotate(180deg)" : "rotate(0deg)"}}>
              <img key={"" + renderedCards.length} 
                src={cardFilePrefix + cardName} 
                alt={cardName}
                style={{
                  width: "100%", height: "auto",
                  position: "absolute", 
                  left: 0,
                  objectFit: "cover",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            </Box>
        </Paper>);
      })
      if (isOpponent) {
        renderedCards.reverse();
      }

      return <Stack key={isOpponent + "Obtained"} 
        direction={isOpponent ? "column": "column-reverse"}
        spacing={isOpponent ? 2 : 1} alignItems={isOpponent ? "flex-start" : "flex-end"}
        sx={{
          overflowX: "visible",
        }}
      >
        <Stack key={isOpponent + "ObtainedStack"} 
          direction={"row"}
          spacing={"-" + overlapPercentage} 
          width="100%"
          justifyContent={!isOpponent ? "flex-end" : "flex-start"}
          sx={{
            overflowX: "visible",
          }}
        >
          {(renderedCards.length == 0 && !isOpponent) && dummyElement}
          {renderedCards}
          {(renderedCards.length == 0 && isOpponent) && dummyElement}
        </Stack>
        {!isOpponent && playerStats}
        {countText}
      </Stack>
    }

    let gameControls = <></>
    if (!gameStats.started) {
      let enabled = (gameLayout.player.length > 0 && (!gameLayout.hasOpponent || gameLayout.opponent.length > 0));
      gameControls = <Stack direction="column" spacing={1} alignItems="center" justifyContent={"center"}>
        <Button variant="outlined" className="chinese"
          sx={{
            width: "auto"
          }}
          disabled={!enabled}
          onClick={() => {
            // picked
            let playerPicked = []
            for (let i = 0; i < gameLayout.player.length; i++) {
              playerPicked.push(false);
            }
            let opponentPicked = []
            if (gameLayout.hasOpponent) {
              for (let i = 0; i < gameLayout.opponent.length; i++) {
                opponentPicked.push(false);
              }
            }
            // obtained
            let playerObtained = []
            let opponentObtained = []
            setGameStats({
              "started": true,
              "opponentPicked": opponentPicked,
              "playerPicked": playerPicked,
              "opponentObtained": opponentObtained,
              "playerObtained": playerObtained,
              "mistaken": {
                "opponent": [],
                "player": [],
              },
              "correctFoundBy": 0,
            })
            setGamePlayerStats({
              "allClicks": 0,
              "allAccumulateTime": 0,
              "correctClicks": 0,
              "correctAccumulateTime": 0,
            })
            setGameRoundStartTimestamp(Date.now());
            reroll();
          }}
        >开始</Button>
        <Typography variant="body1" className="chinese">
          游戏开始时，第一次请点击“播放|暂停”，之后请点击“下一曲”。
        </Typography>
      </Stack>
    } else {
      let isFinished = gameFinished()
      gameControls = <Stack direction="row" alignItems="center" justifyContent={"center"} 
        flexWrap="wrap" useFlexGap
        spacing={{
          sm: 2,
          xs: 1,
        }}
      >
        <Button disabled={isFinished} onClick={() => {
            finishCurrentRound()
            previousMusic()
          }}
          variant="outlined" 
          className="chinese"
          sx={{width: {sm: "auto", xs: "30%"}}}
        >上一曲</Button>
        <Button disabled={isFinished} onClick={() => {
            let audio = audioPlayerRef.current;
            if (audio.paused) {
              setHaveInput(true);
              audio.play();
              createOpponentClickTimeout(currentPlayingId);
              setGameRoundStartTimestamp(Date.now());
            } else {
              setHaveInput(false);
              audio.pause();
            }
          }} 
          variant="outlined" className="chinese"
          sx={{width: {sm: "auto", xs: "30%"}}}
        >播放|暂停</Button>
        <Button disabled={isFinished} onClick={() => {
            finishCurrentRound()
            nextMusic()
          }} 
          variant="outlined" 
          className="chinese"
          sx={{width: {sm: "auto", xs: "30%"}}}
        >下一曲</Button>
        <Button color="error"
          onClick={() => {
            setGameLayout({
              ...gameLayout,
              "opponent": [],
              "player": [],
            })
            setGameStats({
              "started": false,
              "opponentPicked": [],
              "playerPicked": [],
              "opponentObtained": [],
              "playerObtained": [],
              "mistaken": {
                "opponent": [],
                "player": [],
              },
              "correctFoundBy": 0,
            })
          }}
          variant="outlined" 
          sx={{width: {sm: "auto", xs: "30%"}}}
          className="chinese"
        >
          结束游戏
        </Button>
      </Stack>
    }

    return <Grid container spacing={2} padding={2}>
      <Grid item sm={12} xs={12}>
        <Stack spacing={2}>
          <Paper elevation={3} padding={2} className="chinese">
            <Grid container alignItems="center">
              <Grid container sm={4} xs={4} alignItems="center">
                <CheckBox 
                  checked={gameSimulatorEnabled}
                  onChange={(event) => setGameSimulatorEnabled(event.target.checked)}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
                <Typography variant="body" className="chinese">模拟器</Typography>
              </Grid>
              <Grid container sm={4} xs={4} alignItems="center" justifyContent="center">
                <Button variant="text" color="warning" onClick={() => {
                  for (let key in data) {
                    if (key.indexOf("アリス") !== -1) {
                      if (musicIds[key] !== -1 && temporarySkip[key] != true) {
                        setCurrentPlayingId(key);
                      }
                      break;
                    }
                  }
                }} style={{
                  textTransform: "none"
                }}>
                  {isSmallScreen ? "More Alice!" : "We need more Alice!"}
                </Button>
              </Grid>
              <Grid container sm={4} xs={4} alignItems="center" justifyContent="flex-end">
                <Link 
                  href="https://github.com/lightbulb128/touhou-card-player" 
                  marginRight={2}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  源代码
                </Link>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </Grid>

      {gameSimulatorEnabled ? <Grid item sm={12} xs={12}>
        <Stack spacing={2}>
          
          {gameStats.started ? <></> : 
            <Paper elevation={3} padding={2}><Stack spacing={2} padding={2}>
              <Typography variant="h6" className="chinese">对局设置</Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <TextField id="layoutRows" label="行数" variant="outlined" size="small"
                  className="chinese"
                  value={localRows} 
                  onChange={(event) => setLocalRows(event.target.value)}
                  type="number"
                  sx={{width: {sm: "20%", xs: "45%"}}}
                  inputProps={{min: 1, max: 8, step: 1}}
                />
                <TextField id="layoutColumns" label="列数" variant="outlined" size="small"
                  className="chinese"
                  value={localColumns} 
                  onChange={(event) => setLocalColumns(event.target.value)}
                  type="number"
                  sx={{width: {sm: "20%", xs: "45%"}}}
                  inputProps={{min: 1, max: 16, step: 1}}
                />
                <TextField id="deckWidthPercentage" label="布局宽度百分比" variant="outlined" size="small"
                  className="chinese"
                  value={localDeckWidthPercentage} 
                  onChange={(event) => setLocalDeckWidthPercentage(event.target.value)}
                  type="number"
                  sx={{width: {sm: "20%", xs: "45%"}}}
                  inputProps={{min: 10, max: 180, step: 1}}
                />
                <Button variant="outlined" className="chinese"
                  sx={{width: {sm: "20%", xs: "45%"}}}
                  onClick={() => {
                    let totalCount = parseInt(localRows) * parseInt(localColumns);
                    // if opponent or player is larger than totalCount, remove the last ones
                    let newOpponent = gameLayout.opponent.slice(0, Math.min(totalCount, gameLayout.opponent.length));
                    let newPlayer = gameLayout.player.slice(0, Math.min(totalCount, gameLayout.player.length));
                    setGameLayout({...gameLayout, 
                      "columns": parseInt(localColumns),
                      "rows": parseInt(localRows),
                      "deckWidthPercentage": parseInt(localDeckWidthPercentage),
                      "opponent": newOpponent, 
                      "player": newPlayer
                    })
                  }}
                >应用</Button>
              </Stack>
              <Divider />

              <Stack spacing={2} direction="row" alignItems="center">
                <Typography variant="h6" className="chinese">对手</Typography>
                <Grid item className="chinese">
                  <CheckBox id="hasOpponent" label="对手" variant="outlined" size="small"
                    checked={gameLayout.hasOpponent}
                    onChange={(event) => setGameLayout({...gameLayout, "hasOpponent": event.target.checked})}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />启用
                </Grid>
              </Stack>
              
              <Stack spacing={2}>
                {gameLayout.hasOpponent ? <>
                  <Typography variant="body2" className="chinese">
                    对手将持有反向放置的一组卡片。对手逻辑为，首先判定是否迅速或迟疑做出反应。
                    若迅速，则反应时间为平均时间的 0.3 倍。若迟疑，则反应时间为平均时间的 2 倍。
                    否则，均匀在平均时间的 0.7 到 1.3 倍之间随机选择。在反应时间结束时，选择是否犯错。
                  </Typography>
                </> : <></>}
                {gameLayout.hasOpponent ? <Stack direction="row" spacing={2}>
                  <Button variant="outlined" className="chinese" color="warning"
                    sx={{width: {sm: "20%", xs: "45%"}}}
                    onClick={() => {
                      setGameLayout({...gameLayout, "opponent": []})
                  }}>
                    清空
                  </Button>
                  <Button variant="outlined" className="chinese" 
                  sx={{width: {sm: "20%", xs: "45%"}}}
                  onClick={() => {
                    let selectableCharacters = []
                    Object.entries(data).forEach(([character, value], index) => {
                      if (musicIds[character] === -1) {
                        return;
                      }
                      // so long as not selected by player
                      for (let i = 0; i < gameLayout.player.length; i++) {
                        if (gameLayout.player[i][0] === character) {
                          return;
                        }
                      }
                      selectableCharacters.push(character);
                    });
                    if (selectableCharacters.length < totalCount) {
                      showAlert("无法抽取对手卡片，因为剩余卡片不足。" +
                        "需要" + totalCount + "张卡片，但只有" + selectableCharacters.length + "人物可选。");
                      return;
                    }
                    let selectableCards = []
                    selectableCharacters.forEach((character) => {
                      let cardList = data[character]["card"];
                      if (typeof cardList === 'string') {
                        cardList = [cardList];
                      }
                      let cardId = Math.floor(Math.random() * cardList.length);
                      selectableCards.push([character, cardId]);
                    });
                    // select remaining count from selectableCards
                    let newOpponent = gameLayout.opponent.slice();
                    while (newOpponent.length < totalCount) {
                      let index = Math.floor(Math.random() * selectableCards.length);
                      newOpponent.push(selectableCards[index]);
                      selectableCards.splice(index, 1);
                    }
                    setGameLayout({...gameLayout, "opponent": newOpponent})
                  }}>
                    随机
                  </Button> 
                </Stack> : <></>}
                {gameLayout.hasOpponent ? <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  <TextField id="layoutRows" label="平均反应时间（秒）" variant="outlined" size="small"
                    className="chinese"
                    value={gameOpponentProperties.average} 
                    onChange={(event) => setGameOpponentProperties({
                      ...gameOpponentProperties, 
                      "average": parseFloat(event.target.value)
                    })}
                    type="number"
                    sx={{width: {sm: "20%", xs: "45%"}}}
                    inputProps={{min: 0, max: 5, step: 0.1}}
                  />
                  <TextField id="layoutRows" label="犯错概率" variant="outlined" size="small"
                    className="chinese"
                    value={gameOpponentProperties.mistakeRate} 
                    onChange={(event) => {
                      setGameOpponentProperties({
                        ...gameOpponentProperties, 
                        "mistakeRate": parseFloat(event.target.value)
                      });
                    }
                  }
                    type="number"
                    sx={{width: {sm: "20%", xs: "45%"}}}
                    inputProps={{min: 0, max: 1, step: 0.05}}
                  />
                  <TextField id="layoutRows" label="迟疑概率" variant="outlined" size="small"
                    className="chinese"
                    value={gameOpponentProperties.slowRate} 
                    onChange={(event) => setGameOpponentProperties({
                      ...gameOpponentProperties, 
                      "slowRate": parseFloat(event.target.value)
                    })}
                    type="number"
                    sx={{width: {sm: "20%", xs: "45%"}}}
                    inputProps={{min: 0, max: 0.5, step: 0.05}}
                  />
                  <TextField id="layoutRows" label="迅速概率" variant="outlined" size="small"
                    className="chinese"
                    value={gameOpponentProperties.fastRate} 
                    onChange={(event) => setGameOpponentProperties({
                      ...gameOpponentProperties, 
                      "fastRate": parseFloat(event.target.value)
                    })}
                    type="number"
                    sx={{width: {sm: "20%", xs: "45%"}}}
                    inputProps={{min: 0, max: 0.5, step: 0.05}}
                  />
                </Stack> : <></>}
                {gameLayout.hasOpponent ? <Stack direction="column" spacing={1} flexWrap="wrap" useFlexGap>
                  <Grid item className="chinese">
                    <CheckBox id="giveAtMistake" label="giveAtMistake" variant="outlined" size="small"
                      checked={gameLayout.giveAtMistake}
                      onChange={(event) => setGameLayout({...gameLayout, "giveAtMistake": event.target.checked})}
                      inputProps={{ 'aria-label': 'controlled' }}
                    />传统模式
                  </Grid>
                  <Typography variant="body2" className="chinese">
                    传统模式下，正确选择对手区域卡片，将随机给与一张我方区域卡片给对手。错误选择卡片时，将从对方区域卡片中随机选择一张卡片给与我方区域。获胜条件为我方区域清空全部卡片。
                  </Typography>
                  <Typography variant="body2" className="chinese">
                    非传统模式下，选择卡片错误无惩罚，清空所有卡片时游戏结束，获胜者为获取卡片最多者。
                  </Typography>
                </Stack> : <></>}
              </Stack>

              <Divider />
              <Typography variant="h6" className="chinese">本方</Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Button variant="outlined" width="100" className="chinese" 
                  sx={{width: {sm: "20%", xs: "30%"}}} color="warning"
                  onClick={() => {
                    setGameLayout({...gameLayout, "player": []})
                  }}
                >
                  清空
                </Button>
                <Button variant="outlined" width="100" className="chinese" 
                  sx={{width: {sm: "20%", xs: "30%"}}}
                  disabled={gameLayout.player.length === gameLayout.columns * gameLayout.rows}
                  onClick={() => {
                    let selectableCharacters = []
                    Object.entries(data).forEach(([character, value], index) => {
                      let cardList = value["card"];
                      if (typeof cardList === 'string') {
                        cardList = [cardList];
                      }
                      for (let i = 0; i < cardList.length; i++) {
                        let option = selectOption(character, i, gameLayout);
                        if (option === 1) {
                          selectableCharacters.push(character);
                          break;
                        }
                      }
                    });
                    if (selectableCharacters.length < totalCount - gameLayout.player.length) {
                      showAlert("无法抽取剩余本方卡片，因为剩余卡片不足。" +
                        "需要" + (totalCount - gameLayout.player.length) + "张卡片，但只有" + selectableCharacters.length + "人物可选。");
                      return;
                    }
                    let selectableCards = []
                    selectableCharacters.forEach((character) => {
                      let cardList = data[character]["card"];
                      if (typeof cardList === 'string') {
                        cardList = [cardList];
                      }
                      let cardId = Math.floor(Math.random() * cardList.length);
                      selectableCards.push([character, cardId]);
                    });
                    // select remaining count from selectableCards
                    let newPlayer = gameLayout.player.slice();
                    while (newPlayer.length < totalCount) {
                      let index = Math.floor(Math.random() * selectableCards.length);
                      newPlayer.push(selectableCards[index]);
                      selectableCards.splice(index, 1);
                    }
                    setGameLayout({...gameLayout, "player": newPlayer})
                  }}
                >
                  {gameLayout.player.length === 0 ? "随机填满" : "随机补全"}
                </Button> 
                <Button variant="outlined" width="100" className="chinese" 
                  sx={{width: {sm: "20%", xs: "30%"}}}
                  onClick={() => {
                    let old = gameLayout.player.slice();
                    for (let i = 0; i < old.length; i++) {
                      let j = Math.floor(Math.random() * old.length);
                      let temp = old[i];
                      old[i] = old[j];
                      old[j] = temp;
                    }
                    setGameLayout({...gameLayout, "player": old})
                  }}
                >
                  乱序
                </Button>
              </Stack>
              <Stack direction="row" spacing={2} paddingBottom={2} sx={
                {whiteSpace: "nowrap", overflow: "auto", display: "flex", flexWrap: "nowrap"}
              }>
                {cardSelector}
              </Stack>
            </Stack></Paper>
          }

          <Paper elevation={3} padding={2}><Stack padding={2}>
            {(gameStats.started && gameLayout.hasOpponent) ? renderObtained(gameStats.opponentObtained, true) : <></>}
            {gameLayout.hasOpponent ? renderDeck(gameLayout.opponent, gameStats.opponentPicked, true) : <></>}
            {gameControls}
            {renderDeck(gameLayout.player, gameStats.playerPicked, false)}
            {gameStats.started ? renderObtained(gameStats.playerObtained, false) : <></>}
          </Stack></Paper>

        </Stack>
      </Grid>: <></>}
    </Grid>
  }

  function renderAll() {

    return (
      <Stack spacing={0}>
        <Collapse in={alertInfo.message !== ""}>
          <Alert severity="warning" className="chinese">
            {alertInfo.message}
          </Alert>
        </Collapse>
        {renderGameSimulator()}
        <Box style={{
          display: gameSimulatorEnabled ? "none" : "block",
        }} padding={2} paddingTop={0}>
          {renderAllMusicPlayer()}
        </Box>  
      </Stack>
    )
  }

  useEffect(() => {
    // fetch data.json
    if (!isLoading) return;
    fetch('data.json')
      .then(response => response.json())
      .then(data => {
        setData(data["data"]);
        setMusicSources(data["sources"]);
        let dataIdPresets = data["idpresets"]
        data = data["data"];
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
        let temporarySkip = {}
        Object.entries(data).forEach(([key, value]) => {
          musicIds[key] = 0;
          temporarySkip[key] = false;
        });
        // play order
        let playOrder = []
        Object.entries(data).forEach(([key, value]) => {
          playOrder.push(key);
        });
        let currentPlayingId = playOrder[0];

        // create a list of all characters, in order to load cookies
        let characters = []
        Object.entries(data).forEach(([key, value]) => {
          characters.push(key);
        });
        let cardFilePrefix = "./cards/";

        function resetCookies() {
          console.log("Error loading cookies");
          playOrder = []
          Object.entries(data).forEach(([key, value]) => {
            playOrder.push(key);
          });
          musicIds = {}
          Object.entries(data).forEach(([key, value]) => {
            musicIds[key] = 0;
          });
          currentPlayingId = playOrder[0];
          cardFilePrefix = "./cards/";
          // clear all cookies
          docCookies.removeItem("numCharacters");
          docCookies.removeItem("playOrder");
          docCookies.removeItem("musicIds");
          docCookies.removeItem("currentPlayingId");
          docCookies.removeItem("cardFilePrefix");
        }

        try {
          let cookieNumCharacters = docCookies.getItem("numCharacters");
          if (cookieNumCharacters !== null && parseInt(cookieNumCharacters) === characterCount) {
            // load cookies only if the number of characters is the same
            let cookiePlayOrder = docCookies.getItem("playOrder");
            if (cookiePlayOrder !== null) {
              cookiePlayOrder = cookiePlayOrder.split(",");
              let newPlayOrder = []
              cookiePlayOrder.forEach((id) => {
                newPlayOrder.push(characters[parseInt(id)]);
              })
              playOrder = newPlayOrder;
            }
            let cookieMusicIds = docCookies.getItem("musicIds");
            if (cookieMusicIds !== null) {
              cookieMusicIds = cookieMusicIds.split(",");
              let newMusicIds = {}
              cookieMusicIds.forEach((id, index) => {
                let v = parseInt(id);
                if (Number.isNaN(v) || v < -1 || v >= data[characters[index]]["music"].length) {
                  throw "Invalid music id";
                }
                newMusicIds[characters[index]] = v;
              })
              musicIds = newMusicIds;
            }
            let cookieCurrentPlayingId = docCookies.getItem("currentPlayingId");
            if (cookieCurrentPlayingId !== null) {
              let v = parseInt(cookieCurrentPlayingId);
              if (v < characters.length) {
                currentPlayingId = characters[v];
              }
            }
          }
          let cookieCardFilePrefix = docCookies.getItem("cardFilePrefix");
          if (cookieCardFilePrefix !== null) {
            cardFilePrefix = cookieCardFilePrefix;
            // check cardFilePrefix is in the list of cardFilePrefixes
            let found = false;
            for (let i = 0; i < cardStyleSet.length; i++) {
              if (cardFilePrefix === cardStyleSet[i][1]) {
                found = true;
                break;
              }
            }
            if (!found) {
              throw "Invalid card file prefix";
            }
          }
        } catch {
          resetCookies()
        }

        setCardFilePrefix(cardFilePrefix);

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
        setPlayOrder(playOrder);
        setCardIds(cardIds);
        setMusicIds(musicIds);
        setCurrentPlayingId(currentPlayingId);
        setIsloading(false);
        setTemporarySkip(temporarySkip);
        // audioPlayerRef.current.volume = 0.5;

        let defaultPreset = {}
        Object.entries(musicIds).forEach(([key, value]) => {
          defaultPreset[key] = 0;
        })
        let presetsData = {}
        presetsData["默认"] = defaultPreset;

        Object.entries(dataIdPresets).forEach(([key, value]) => {
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
