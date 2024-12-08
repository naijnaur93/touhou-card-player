import {
  List, ListItem, Button, Typography, IconButton, Box, Paper, Stack, Slider, TextField
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import CardComponent from "./cardComponent";
import {
  East as DeckLargerIcon,
  West as DeckSmallerIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  AccessibleForward as OpponentIcon,
  Shuffle as ShuffleIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Loop as TraditionalIcon,
} from "@mui/icons-material";
import { PlayControls } from "./playControls";

function CardPlaceholder() {
  return <CardComponent
    noImage
    width="100%"
    paperStyles={{
      backgroundColor: "transparent",
      border: "2px dashed gray",
    }}
  ></CardComponent>
}

const GameSimulatorPanel = ({ renderContents, data, globalState, globalMethods }) => {

  let canvasRef = useRef(null);

  const [layoutInfo, rawSetLayoutInfo] = useState({
    canvasWidth: 0,
    canvasHeight: 0,
    deckWidth: 8,
    deckHeight: 3,
    deckCanvasRatio: 0.7,
    hasOpponent: false,
  });
  const [sliderValue, setSliderValue] = useState(0);
  const [deckInfo, setDeckInfo] = useState({
    // elements inside should be [character: str, cardId: int] or null
    playerDeck: Array(layoutInfo.deckWidth * layoutInfo.deckHeight).fill(null),
    opponentDeck: Array(layoutInfo.deckWidth * layoutInfo.deckHeight).fill(null),
  });
  const [gameInfo, setGameInfo] = useState({
    gameStarted: false,
    playerObtained: [],
    opponentObtained: [],
  });
  const [roundInfo, setRoundInfo] = useState({
    opponentTimeoutSet: false,
    opponentTimeout: null,
    opponentMistaken: [],
    playerMistaken: [],
    foundBy: 0,
  })
  const [opponentSettings, setOpponentSettings] = useState({
    timeAverage: 8,
    timeDeviation: 3,
    mistakeRate: 0.1,
    traditionalMode: false,
  });

  const timeoutReadRef = useRef(null);

  useEffect(() => {
    timeoutReadRef.current = {
      layoutInfo: layoutInfo,
      deckInfo: deckInfo,
      gameInfo: gameInfo,
      roundInfo: roundInfo,
      opponentSettings: opponentSettings,
      globalState: globalState,
    }
  });

  function setLayoutInfo(newLayoutInfo) {
    const cardCount = newLayoutInfo.deckWidth * newLayoutInfo.deckHeight;
    const needUpdateDeckInfo = (
      cardCount !== deckInfo.playerDeck.length ||
      (newLayoutInfo.hasOpponent && cardCount !== deckInfo.opponentDeck.length) ||
      (!newLayoutInfo.hasOpponent && deckInfo.opponentDeck.length > 0)
    )
    if (needUpdateDeckInfo) {
      let newPlayerDeck = deckInfo.playerDeck.slice();
      if (newPlayerDeck.length > cardCount) {
        newPlayerDeck = newPlayerDeck.slice(0, cardCount);
      }
      while (newPlayerDeck.length < cardCount) {
        newPlayerDeck.push(null);
      }
      let newOpponentDeck = [];
      if (newLayoutInfo.hasOpponent) {
        newOpponentDeck = deckInfo.opponentDeck.slice();
        if (newOpponentDeck.length > cardCount) {
          newOpponentDeck = newOpponentDeck.slice(0, cardCount);
        }
        while (newOpponentDeck.length < cardCount) {
          newOpponentDeck.push(null);
        }
      }
      const newDeckInfo = {
        playerDeck: newPlayerDeck,
        opponentDeck: newOpponentDeck,
      }
      setDeckInfo(newDeckInfo);
    }
    rawSetLayoutInfo(newLayoutInfo);
  }
  
  useEffect(() => {
    const handleResize = () => {
      let updater = {}
      if (canvasRef.current) {
        updater = {
          ...updater,
          canvasWidth: canvasRef.current.clientHeight,
          canvasHeight: canvasRef.current.clientWidth,
        }
      }
      let flag = false;
      Object.keys(updater).forEach((key, index) => {
        if (layoutInfo[key] != updater[key]) {
          flag = true;
        }
      })
      if (flag) {
        setLayoutInfo({
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
  }, [layoutInfo, setLayoutInfo])

  const optionState = globalState.optionState;
  const gameStarted = gameInfo.gameStarted;
  const hasOpponent = layoutInfo.hasOpponent;

  const canvasMargin = 16;
  const canvasSpacing = 6;
  const cards = {};
  const cardAspectRatio = 703 / 1000;
  const cardSpacing = canvasSpacing;
  const clientWidth = canvasRef.current ? canvasRef.current.clientWidth : 0;
  const canvasWidth = clientWidth;
  let cardWidth = 0;
  let deckLeft = 0;
  let deckWidthPixels = 0;
  if (canvasRef.current) {
    deckWidthPixels = canvasRef.current.clientWidth * layoutInfo.deckCanvasRatio;
    cardWidth = (deckWidthPixels - cardSpacing * (layoutInfo.deckWidth - 1)) / layoutInfo.deckWidth;
    if (cardWidth < 0) { cardWidth = 0; }
    deckLeft = (canvasRef.current.clientWidth - deckWidthPixels) / 2;
  }
  const cardHeight = cardWidth / cardAspectRatio;
  const sliderHeight = 28;
  const playControlsWidth = 209;
  const playControlsHeight = 59;
  let middlebandCardHeight = !gameStarted ? 0.8 * cardHeight : (playControlsHeight - canvasSpacing - sliderHeight) / 1.1;
  if (middlebandCardHeight < 0) { middlebandCardHeight = 0; }
  let middlebandHeight = middlebandCardHeight * (1 + 0.1) + sliderHeight + canvasSpacing;
  if (gameStarted) {
    middlebandHeight = playControlsHeight;
  }
  const opponentObtainedTop = canvasMargin;
  const opponentDeckTop = !gameStarted ? canvasMargin : (opponentObtainedTop + cardHeight + canvasSpacing);
  const opponentDeckBottom = opponentDeckTop + (!hasOpponent ? 0 : cardHeight * layoutInfo.deckHeight + cardSpacing * (layoutInfo.deckHeight - 1));
  let middlebandTop = opponentDeckBottom + (!hasOpponent ? 0 : canvasSpacing);
  const playerDeckTop = middlebandTop + middlebandHeight + canvasSpacing;
  const playerDeckBottom = playerDeckTop + cardHeight * layoutInfo.deckHeight + cardSpacing * (layoutInfo.deckHeight - 1);
  const playerObtainedTop = playerDeckBottom + canvasSpacing;
  let canvasHeight = !gameStarted ? playerDeckBottom + canvasMargin : playerObtainedTop + cardHeight + canvasMargin;
  const buttonSize = 24;
  if (!gameStarted) {
    canvasHeight += canvasSpacing + buttonSize;
  }
  const characterCount = Object.keys(data.data).length;

  if (!renderContents) {
    return <Box width="100%" padding={1}>
      <Paper 
        ref={canvasRef}
        variant="outlined"
        sx={{
          width: "100%",
          height: canvasHeight,
          position: "relative",
          overflow: "hidden",
          transition: "height 0.5s",
        }}
      >
        Placeholder text
      </Paper>
    </Box>
  }

  const characterExists = (character) => {
    if (character === null) return false;
    return globalState.musicPlayerState.musicIds[character] !== -1;
  }

  let playerDeckFilled = deckInfo.playerDeck.map((deckCard) => deckCard !== null && characterExists(deckCard[0]));
  let opponentDeckFilled = deckInfo.opponentDeck.map((deckCard) => deckCard !== null && characterExists(deckCard[0]));
  
  const opponentEnabledButtonLeft = deckLeft - buttonSize - canvasSpacing;
  const opponentEnabledButtonTop = hasOpponent ? opponentDeckBottom - buttonSize : playerDeckTop
  const opponentDeckFilledCount = opponentDeckFilled.filter((value) => value).length;
  const opponentDeckFull = opponentDeckFilledCount === deckInfo.opponentDeck.length;
  const opponentDeckEmpty = opponentDeckFilledCount === 0;
  const playerDeckFilledCount = playerDeckFilled.filter((value) => value).length;
  const playerDeckFull = playerDeckFilledCount === deckInfo.playerDeck.length;
  const playerDeckEmpty = playerDeckFilledCount === 0;

  let gameFinished = !gameStarted;
  const traditionalMode = opponentSettings.traditionalMode;
  if (gameStarted) {
    if (traditionalMode) {
      gameFinished = playerDeckEmpty || opponentDeckEmpty;
    } else {
      gameFinished = playerDeckEmpty && opponentDeckEmpty;
    }
  }

  // calculate card positioning and size infos
  let cardRenderInfos = {};
  let cardPlaceholderInfos = [];

  Object.entries(data.data).forEach(([character, characterData]) => {
    if (!characterExists(character)) {return;}
    let filenames = characterData["card"]
    if (typeof filenames === "string") {
      filenames = [filenames];
    }
    filenames = filenames.map((filename) => {
      return optionState.relativeRoot + optionState.cardPrefix + filename;
    });
    let characterCardInfos = [];
    filenames.forEach((filename, index) => {
      const cardRenderInfo = {
        shown: true,
        key: "card" + character + index,
        filename: filename,
        character: character,
        cardIndex: index,
        width: 0, // height is automatically calculated from width by aspect ratio
        left: 0,
        top: 0,
        reversed: false,
        zIndex: 0,
        props: {},
        boxStyles: {},
        paperStyles: {},
        imageStyles: {},
        backgroundColor: "white",
        grayscale: false,
        assigned: false,
        inDeck: false,
      }
      characterCardInfos.push(cardRenderInfo);
    });
    cardRenderInfos[character] = characterCardInfos;
  });

  deckInfo.playerDeck.forEach((deckCard, index) => {
    const left = deckLeft + (index % layoutInfo.deckWidth) * (cardWidth + cardSpacing);
    const top = playerDeckTop + Math.floor(index / layoutInfo.deckWidth) * (cardHeight + cardSpacing);
    if (deckCard == null || !characterExists(deckCard[0])) {
      if (!gameStarted) {
        cardPlaceholderInfos.push({
          key: "placeholder" + cardPlaceholderInfos.length,
          left, top, width: cardWidth, height: cardHeight,
        })
      }
    } else {
      const [character, cardIndex] = deckCard;
      if (!characterExists(character)) {return;}
      const cardRenderInfo = cardRenderInfos[character][cardIndex];
      cardRenderInfo.inDeck = true;
      cardRenderInfo.left = left;
      cardRenderInfo.top = top;
      cardRenderInfo.width = cardWidth;
      cardRenderInfo.assigned = true;
      cardRenderInfos[character].forEach((otherCard) => {
        if (otherCard.cardIndex !== cardIndex) {
          otherCard.left = left;
          otherCard.top = top;
          otherCard.width = cardWidth;
          otherCard.assigned = true;
        }
      });
      if (!gameStarted) {
        cardRenderInfo.props["onClick"] = () => {
          let newPlayerDeck = deckInfo.playerDeck.slice();
          newPlayerDeck[index] = null;
          setDeckInfo({
            ...deckInfo,
            playerDeck: newPlayerDeck,
          });
        }
      }
    }
  });

  if (layoutInfo.hasOpponent) {
    deckInfo.opponentDeck.forEach((deckCard, index) => {
      const left = deckLeft + (index % layoutInfo.deckWidth) * (cardWidth + cardSpacing);
      const top = opponentDeckTop + Math.floor(index / layoutInfo.deckWidth) * (cardHeight + cardSpacing);
      if (deckCard == null || !characterExists(deckCard[0])) {
        if (!gameStarted) {
          cardPlaceholderInfos.push({
            key: "placeholder" + cardPlaceholderInfos.length,
            left, top, width: cardWidth, height: cardHeight,
          })
        }
      } else {
        const [character, cardIndex] = deckCard;
        if (!characterExists(character)) {return;}
        const cardRenderInfo = cardRenderInfos[character][cardIndex];
        cardRenderInfo.inDeck = true;
        cardRenderInfo.left = left;
        cardRenderInfo.top = top;
        cardRenderInfo.width = cardWidth;
        cardRenderInfo.reversed = true;
        cardRenderInfo.assigned = true;
        cardRenderInfos[character].forEach((otherCard) => {
          if (otherCard.cardIndex !== cardIndex) {
            otherCard.left = left;
            otherCard.top = top;
            otherCard.width = cardWidth;
            otherCard.reversed = true;
            otherCard.assigned = true;
          }
        });
        if (!gameStarted) {
          cardRenderInfo.props["onClick"] = () => {
            let newOpponentDeck = deckInfo.opponentDeck.slice();
            newOpponentDeck[index] = null;
            setDeckInfo({
              ...deckInfo,
              opponentDeck: newOpponentDeck,
            });
          }
        }
      }
    });
  }
  
  // for those in deck
  Object.entries(cardRenderInfos).forEach(([character, characterCardInfos]) => {
    characterCardInfos.forEach((cardRenderInfo) => {
      if (!cardRenderInfo.inDeck) {return;}
      // backcolor
      if (!gameStarted) {
        cardRenderInfo.paperStyles["&:hover"] = {
          backgroundColor: "lightcyan",
        }
      } else {
        if (roundInfo.opponentMistaken.includes(character) || roundInfo.playerMistaken.includes(character)) {
          cardRenderInfo.backgroundColor = "lightsalmon";
        } else if (roundInfo.foundBy !== 0 && character === globalState.musicPlayerState.currentPlaying) {
          cardRenderInfo.backgroundColor = "lightgreen";
        } else if (roundInfo.foundBy === 0) {
          cardRenderInfo.paperStyles["&:hover"] = {
            backgroundColor: "lightcyan",
          }
        }
      }
      // onclick when game has started
      if (gameStarted) {
        cardRenderInfo.props["onClick"] = () => {
          if (roundInfo.foundBy !== 0) {return;}
          if (gameFinished) {return;}
          if (roundInfo.opponentMistaken.includes(character) || roundInfo.playerMistaken.includes(character)) {return;}
          if (character === globalState.musicPlayerState.currentPlaying) {
            setRoundInfo({
              ...roundInfo,
              foundBy: 1,
            });
          } else {
            let newPlayerMistaken = roundInfo.playerMistaken.slice();
            newPlayerMistaken.push(character);
            setRoundInfo({
              ...roundInfo,
              playerMistaken: newPlayerMistaken,
            });
          }
        }
      }
      cardRenderInfo.zIndex = 1; // for those with the same character but not same cardIndex, zIndex = 0 so that it is hidden
    });
  });

  // for obtained
  const playerObtained = gameInfo.playerObtained.filter((card) => characterExists(card[0]));
  const opponentObtained = gameInfo.opponentObtained.filter((card) => characterExists(card[0]));
  if (gameStarted) {
    const availableWidth = canvasWidth - 2 * canvasMargin - cardWidth - canvasSpacing;
    {
      let obtainedOverlap = cardWidth * 0.6;
      const requiredWidth = ((playerObtained.length > 0) 
        ? cardWidth * playerObtained.length - obtainedOverlap * (playerObtained.length - 1)
        : 0
      );
      if (playerObtained.length > 1 && requiredWidth > availableWidth) {
        obtainedOverlap = (availableWidth - cardWidth * playerObtained.length) / (playerObtained.length - 1);
      }
      const offset = canvasWidth - canvasMargin - cardWidth * 2 - canvasSpacing;
      for (let i = playerObtained.length - 1; i >= 0; i--) {
        let character = playerObtained[i][0];
        let cardIndex = playerObtained[i][1];
        cardRenderInfos[character].forEach((cardRenderInfo, index) => {
          cardRenderInfo.left = offset - (playerObtained.length - 1 - i) * (cardWidth - obtainedOverlap);
          cardRenderInfo.top = playerObtainedTop;
          cardRenderInfo.width = cardWidth;
          cardRenderInfo.zIndex = index === cardIndex ? i + 1 : 0;
          cardRenderInfo.assigned = true;
        });
      }
    }
    if (hasOpponent) {
      let obtainedOverlap = cardWidth * 0.6;
      const requiredWidth = ((opponentObtained.length > 0) 
        ? cardWidth * opponentObtained.length - obtainedOverlap * (opponentObtained.length - 1)
        : 0
      );
      if (opponentObtained.length > 1 && requiredWidth > availableWidth) {
        obtainedOverlap = (availableWidth - cardWidth * opponentObtained.length) / (opponentObtained.length - 1);
      }
      const offset = canvasMargin + canvasSpacing + cardWidth;
      for (let i = opponentObtained.length - 1; i >= 0; i--) {
        let character = opponentObtained[i][0];
        let cardIndex = opponentObtained[i][1];
        cardRenderInfos[character].forEach((cardRenderInfo, index) => {
          cardRenderInfo.left = offset + (opponentObtained.length - 1 - i) * (cardWidth - obtainedOverlap);
          cardRenderInfo.top = opponentObtainedTop;
          cardRenderInfo.width = cardWidth;
          cardRenderInfo.zIndex = index === cardIndex ? i + 1 : 0;
          cardRenderInfo.reversed = true;
          cardRenderInfo.assigned = true;
        });
      }
    }
  }

  // for those not assigned
  if (!gameStarted) { // the cards are placed in the middleband to be selected
    let counter = 0;
    const cardHeight = middlebandCardHeight;
    const cardWidth = cardHeight * cardAspectRatio;
    const cardOverlap = cardWidth * 0.15;
    const canSelectMoreCards = playerDeckFilled.includes(false) || (layoutInfo.hasOpponent && opponentDeckFilled.includes(false));
    Object.entries(cardRenderInfos).forEach(([character, characterCardInfos]) => {
      characterCardInfos.forEach((cardRenderInfo) => {
        if (!cardRenderInfo.assigned) {
          cardRenderInfo.left = deckLeft + counter * (cardWidth - cardOverlap);
          cardRenderInfo.top = middlebandTop + cardHeight * 0.1;
          cardRenderInfo.width = cardWidth;
          if (canSelectMoreCards) {cardRenderInfo.props["onClick"] = () => {
            // if playerDeck has null value, assign the card to it; or if opponentDeck has null value, assign the card to it
            let index = playerDeckFilled.indexOf(false);
            if (index >= 0) {
              let newPlayerDeck = deckInfo.playerDeck.slice();
              newPlayerDeck[index] = [character, cardRenderInfo.cardIndex];
              setDeckInfo({
                ...deckInfo,
                playerDeck: newPlayerDeck,
              });
            } else if (layoutInfo.hasOpponent) {
              let index = opponentDeckFilled.indexOf(false);
              if (index >= 0) {
                let newOpponentDeck = deckInfo.opponentDeck.slice();
                newOpponentDeck[index] = [character, cardRenderInfo.cardIndex];
                setDeckInfo({
                  ...deckInfo,
                  opponentDeck: newOpponentDeck,
                });
              }
            }
          }}
          if (!canSelectMoreCards) {
            cardRenderInfo.backgroundColor = "lightgray";
            cardRenderInfo.grayscale = true;
          } else {
            cardRenderInfo.paperStyles["&:hover"] = {
              backgroundColor: "lightcyan",
              transform: "translateY(-10%)",
            }
          }
          counter++;
        }
      });
    });
    let displacement = 0;
    if (counter > 0) {
      let totalStretch = (counter - 1) * (cardWidth - cardOverlap) - (deckWidthPixels - cardWidth);
      if (totalStretch < 0) { totalStretch = 0; }
      displacement = totalStretch * sliderValue / 100;
    }
    let zIndexCounter = counter;
    Object.entries(cardRenderInfos).forEach(([character, characterCardInfos]) => {
      characterCardInfos.forEach((cardRenderInfo) => {
        if (!cardRenderInfo.assigned) {
          cardRenderInfo.left -= displacement;
          cardRenderInfo.zIndex = zIndexCounter;
          zIndexCounter--;
          cardRenderInfo.assigned = true;
        }
      });
    });
  } else {
    const cardHeight = middlebandCardHeight;
    const cardWidth = cardHeight * cardAspectRatio;
    let counter = 0;
    Object.entries(cardRenderInfos).forEach(([character, characterCardInfos]) => {
      characterCardInfos.forEach((cardRenderInfo) => {
        if (!cardRenderInfo.assigned) {
          cardRenderInfo.top = opponentDeckBottom + (hasOpponent ? canvasSpacing : 0) + cardHeight * 0.1;  
          cardRenderInfo.width = cardWidth;
          cardRenderInfo.backgroundColor = "lightgray";
          cardRenderInfo.grayscale = true;
          counter++;
        }
      });
    });
    // set zIndex descendingly
    let zIndexCounter = counter;
    Object.entries(cardRenderInfos).forEach(([character, characterCardInfos]) => {
      characterCardInfos.forEach((cardRenderInfo) => {
        if (!cardRenderInfo.assigned) {
          cardRenderInfo.zIndex = zIndexCounter;
          cardRenderInfo.left = -cardWidth * zIndexCounter + canvasSpacing * (zIndexCounter - 1);
          zIndexCounter--;
          cardRenderInfo.assigned = true;
        }
      });
    });
  }

  // for the slider
  let slider = null;
  {
    const sliderTop = middlebandTop + middlebandCardHeight * 1.1 + canvasSpacing;
    slider = <Slider 
      key="slider"
      size="small" sx={{
        width: deckWidthPixels - 20,
        top: sliderTop,
        left: !gameStarted ? deckLeft + 10 : (20 - canvasSpacing - deckWidthPixels),
        position: "absolute",
        transition: "top 0.5s, left 0.5s, width 0.5s",
      }}
      value={sliderValue}
      min={0}
      max={100}
      onChange={(e, newValue) => { // onChangeCommitted
        setSliderValue(newValue);
      }}
    ></Slider>
  }

  let renderedCards = [];
  cardPlaceholderInfos.forEach((cardInfo) => {
    renderedCards.push(<Box
      key={cardInfo.key}
      sx={{
        width: cardInfo.width,
        height: cardInfo.width / cardAspectRatio,
        position: "absolute",
        left: cardInfo.left,
        top: cardInfo.top,
      }}
    >
      <CardPlaceholder></CardPlaceholder>
    </Box>)
  });
  Object.entries(cardRenderInfos).forEach(([character, cardInfos]) => {
    cardInfos.forEach((cardInfo, index) => {
      renderedCards.push(<Box
        key={cardInfo.key}
        sx={{
          width: cardInfo.width,
          height: cardInfo.width / cardAspectRatio,
          position: "absolute",
          left: cardInfo.left,
          top: cardInfo.top,
          zIndex: cardInfo.zIndex,
          transition: "top 0.5s, left 0.5s, width 0.5s, height 0.5s, transform 0.5s",
          transform: cardInfo.reversed ? "rotate(180deg)" : "rotate(0deg)",
          ...cardInfo.boxStyles,
        }}
        {...cardInfo.props}
      >
        <CardComponent src={cardInfo.filename}
          width="100%"
          elevation={3}
          paperStyles={{
            backgroundColor: cardInfo.backgroundColor,
            transition: "transform 0.5s",
            ...cardInfo.paperStyles,
          }}
          imageStyles={{
            filter: cardInfo.grayscale ? "grayscale(100%)" : "none",
            ...cardInfo.imageStyles
          }}
        ></CardComponent>
      </Box>);
    });
  })

  const iconButtonProperties = {
    boxStyle: {
      position: "absolute",
      transition: "top 0.5s, left 0.5s, background-color 0.5s",
      "&:hover": {
        backgroundColor: "primary.main",
      },
      height: buttonSize,
      width: buttonSize,
      borderRadius: buttonSize / 2,
      borderColor: "primary.main",
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      display: "flex",
      zIndex: 100,
    }
  };

  const textfieldHeight = 40;
  const textfieldWidth = 100;
  const textfieldStyles = {
    position: "absolute",
    transition: "top 0.5s, left 0.5s, background-color 0.5s",
    height: textfieldHeight,
    width: textfieldWidth,
  }
  
  function createButton(key, icon, x, y, click, disabled=false, color="primary", lower=false) {
    let boxStyle = {...iconButtonProperties.boxStyle, left: x, top: y, zIndex: lower ? 0 : 100};
    if (disabled) {
      boxStyle["backgroundColor"] = "#444444";
      boxStyle["borderColor"] = "lightgray";
      boxStyle["&:hover"] = null;
    } else {
      boxStyle["&:hover"] = {...iconButtonProperties.boxStyle["&:hover"], backgroundColor: color + ".main"};
      boxStyle["borderColor"] = color + ".main";
    }
    return <Box sx={boxStyle} onClick={disabled ? null : click} key={key}>
      {icon}
    </Box>
  }

  function createText(key, text, x, y, hidden=false, positionedWithRight=false, sx={}) {
    let w = 0;
    if (canvasRef.current) {
      w = canvasRef.current.clientWidth;
    }
    return <Typography
      key={key}
      className="chinese"
      sx={{
        position: "absolute",
        left: positionedWithRight ? "auto" : x,
        right: positionedWithRight ? (w - x) : "auto",
        top: y,
        color: hidden ? "transparent" : "white",
        transition: "color 0.5s, top 0.5s, right 0.5s, left 0.5s",
        ...sx,
      }}
    >
      {text}
    </Typography>
  }

  function getSelectableCharacters() {
    let selectableCharacters = [];
    Object.entries(data.data).forEach(([character, characterData]) => {
      if (globalState.musicPlayerState.musicIds[character] === -1) return;
      let flag = false;
      for (let i = 0; i < deckInfo.playerDeck.length; i++) {
        if (deckInfo.playerDeck[i] && deckInfo.playerDeck[i][0] === character) {
          flag = true;
          break;
        }
      }
      if (flag) return;
      if (layoutInfo.hasOpponent) {
        for (let i = 0; i < deckInfo.opponentDeck.length; i++) {
          if (deckInfo.opponentDeck[i] && deckInfo.opponentDeck[i][0] === character) {
            flag = true;
            break;
          }
        }
        if (flag) return;
      }
      selectableCharacters.push(character);
    });
    return selectableCharacters;
  }


  function resetRoundInfo() {
    if (roundInfo.opponentTimeout) {
      clearTimeout(roundInfo.opponentTimeout);
    }
    setRoundInfo({
      opponentTimeoutSet: false,
      opponentTimeout: null,
      opponentMistaken: [],
      playerMistaken: [],
      foundBy: 0, // 1: player, 2: opponent
    });
  }

  function randomizeOpponentClickTime() {
    const timeAverage = opponentSettings.timeAverage;
    const timeDeviation = opponentSettings.timeDeviation;
    let t = (timeAverage + Math.random() * timeDeviation * 2 - timeDeviation) * 1000;
    if (t < 10) { t = 10; }
    return t; // ms
  }

  function simulateOpponentClick() {
    if (!hasOpponent || !gameStarted) return;
    if (!timeoutReadRef.current) return;
    const { layoutInfo, deckInfo, gameInfo, roundInfo, opponentSettings, globalState } = timeoutReadRef.current;
    let gameFinished = false;
    let playerDeckFilledCount = deckInfo.playerDeck.filter((deckCard) => deckCard !== null).length;
    let playerDeckEmpty = playerDeckFilledCount === 0;
    let opponentDeckFilledCount = deckInfo.opponentDeck.filter((deckCard) => deckCard !== null).length;
    let opponentDeckEmpty = opponentDeckFilledCount === 0;
    if (opponentSettings.traditionalMode) {
      gameFinished = playerDeckEmpty || opponentDeckEmpty;
    } else {
      gameFinished = playerDeckEmpty && opponentDeckEmpty
    }
    if (gameFinished) {
      console.log("Opponent click: Game finished.");
      return;
    }
    if (roundInfo.foundBy === 1) {
      console.log("Opponent click: Player has already taken it.");
      return;
    }
    if (roundInfo.foundBy === 2) {
      console.log("Opponent click: Opponent has already taken it. Maybe some bug?");
      return;
    }
    let mistakeRate = opponentSettings.mistakeRate;
    {
      const cardsOnDeck = playerDeckFilledCount + opponentDeckFilledCount;
      const totalSlotsOnDeck = layoutInfo.deckWidth * layoutInfo.deckHeight * 2;
      mistakeRate *= cardsOnDeck / totalSlotsOnDeck;
    }
    const mistakeDiceRoll = Math.random();
    console.log("Opponent click: Mistake rate: " + mistakeRate + ", dice roll: " + mistakeDiceRoll);
    let currentCharacter = globalState.musicPlayerState.currentPlaying;
    let opponentCorrect = true;
    if (mistakeDiceRoll < mistakeRate) {
      let possibleMistakenCharacters = [];
      deckInfo.playerDeck.forEach((deckCard) => {
        if (deckCard && characterExists(deckCard[0]) && deckCard[0] !== currentCharacter) {
          possibleMistakenCharacters.push(deckCard[0]);
        }
      });
      deckInfo.opponentDeck.forEach((deckCard) => {
        if (deckCard && characterExists(deckCard[0]) && deckCard[0] !== currentCharacter) {
          possibleMistakenCharacters.push(deckCard[0]);
        }
      });
      if (possibleMistakenCharacters.length > 0) {
        opponentCorrect = false;
        const mistakenCharacterDiceRoll = Math.floor(Math.random() * possibleMistakenCharacters.length);
        const mistakenCharacter = possibleMistakenCharacters[mistakenCharacterDiceRoll];
        // add to opponent mistaken
        let newOpponentMistaken = roundInfo.opponentMistaken.slice();
        newOpponentMistaken.push(mistakenCharacter);
        setRoundInfo({
          ...roundInfo,
          opponentTimeout: null,
          opponentMistaken: newOpponentMistaken,
        });
      }
    }
    if (opponentCorrect) {
      let found = false;
      deckInfo.playerDeck.forEach((deckCard) => {
        if (deckCard && deckCard[0] === currentCharacter) {
          found = true;
        }
      });
      deckInfo.opponentDeck.forEach((deckCard) => {
        if (deckCard && deckCard[0] === currentCharacter) {
          found = true;
        }
      });
      if (found) {
        console.log("Opponent click: Correct!");
        setRoundInfo({
          ...roundInfo,
          opponentTimeout: null,
          foundBy: 2,
        });
      } else {
        console.log("Opponent click: No correct card found.");
        setRoundInfo({
          ...roundInfo,
          opponentTimeout: null,
        });
      }
    }
  }

  function settleRound() {
    const currentCharacter = globalState.musicPlayerState.currentPlaying;
    let foundBy = roundInfo.foundBy;
    let foundInPlayerDeck = false;
    let currentCharacterCard = null;
    deckInfo.playerDeck.forEach((deckCard) => {
      if (deckCard && deckCard[0] === currentCharacter) {
        foundInPlayerDeck = true;
        currentCharacterCard = [...deckCard];
      }
    });
    let foundInOpponentDeck = false;
    deckInfo.opponentDeck.forEach((deckCard) => {
      if (deckCard && deckCard[0] === currentCharacter) {
        foundInOpponentDeck = true;
        currentCharacterCard = [...deckCard];
      }
    });
    if (foundBy === 0) {
      // check if there is actually a card with the current character in the deck
      if (foundInPlayerDeck || foundInOpponentDeck) {
        // if so, we count this as opponent's when opponent is present
        if (hasOpponent) {
          foundBy = 2;
        } else {
          foundBy = 1;
        }
      }
    }
    if (foundBy === 1) {
      setGameInfo({
        ...gameInfo,
        playerObtained: [...gameInfo.playerObtained, currentCharacterCard],
      });
    } 
    if (foundBy === 2) {
      setGameInfo({
        ...gameInfo,
        opponentObtained: [...gameInfo.opponentObtained, currentCharacterCard],
      });
    }
    let newPlayerDeck = deckInfo.playerDeck.slice();
    let newOpponentDeck = deckInfo.opponentDeck.slice();
    // remove correct card from either deck, if exists
    if (foundInPlayerDeck) {
      for (let i = 0; i < newPlayerDeck.length; i++) {
        if (newPlayerDeck[i] && newPlayerDeck[i][0] === currentCharacter) {
          newPlayerDeck[i] = null;
        }
      }
    }
    if (foundInOpponentDeck) {
      for (let i = 0; i < newOpponentDeck.length; i++) {
        if (newOpponentDeck[i] && newOpponentDeck[i][0] === currentCharacter) {
          newOpponentDeck[i] = null;
        }
      }
    }
    if (!hasOpponent || !traditionalMode) {
      setDeckInfo({
        playerDeck: newPlayerDeck,
        opponentDeck: newOpponentDeck,
      });
    } else { // traditionalMode && hasOpponent
      let playerGives = newPlayerDeck.map((deckCard) => {
        return (deckCard !== null) && roundInfo.opponentMistaken.includes(deckCard[0]);
      });
      let opponentGives = newOpponentDeck.map((deckCard) => {
        return (deckCard !== null) && roundInfo.playerMistaken.includes(deckCard[0]);
      });
      let playerTakeRandomCount = newPlayerDeck.filter((deckCard) => {
        return (deckCard !== null) && roundInfo.playerMistaken.includes(deckCard[0]);
      }).length;
      let opponentTakeRandomCount = newOpponentDeck.filter((deckCard) => {
        return (deckCard !== null) && roundInfo.opponentMistaken.includes(deckCard[0]);
      }).length;
      if (foundBy === 1 && foundInOpponentDeck) { opponentTakeRandomCount++; }
      if (foundBy === 2 && foundInPlayerDeck) { playerTakeRandomCount++; }
      const minusCount = Math.min(playerTakeRandomCount, opponentTakeRandomCount);
      playerTakeRandomCount -= minusCount;
      opponentTakeRandomCount -= minusCount;
      for (let i = 0; i < playerGives.length; i++) {
        if (playerGives[i] && playerTakeRandomCount > 0) {
          playerGives[i] = false;
          playerTakeRandomCount--;
        }
      }
      for (let i = 0; i < opponentGives.length; i++) {
        if (opponentGives[i] && opponentTakeRandomCount > 0) {
          opponentGives[i] = false;
          opponentTakeRandomCount--;
        }
      }
      while (playerTakeRandomCount > 0) {
        let choices = [];
        newOpponentDeck.forEach((deckCard, index) => {
          let a = deckCard && characterExists(deckCard[0]) && !opponentGives[index];
          if (a) {choices.push(index);}
        });
        if (choices.length === 0) break;
        const choiceIndex = Math.floor(Math.random() * choices.length);
        const choice = choices[choiceIndex];
        opponentGives[choice] = true;
        playerTakeRandomCount--;
      }
      while (opponentTakeRandomCount > 0) {
        let choices = [];
        newPlayerDeck.forEach((deckCard, index) => {
          let a = deckCard && characterExists(deckCard[0]) && !playerGives[index];
          if (a) {choices.push(index);}
        });
        if (choices.length === 0) break;
        const choiceIndex = Math.floor(Math.random() * choices.length);
        const choice = choices[choiceIndex];
        playerGives[choice] = true;
        opponentTakeRandomCount--;
      }
      // cancel gives in playerGives and opponentGives
      while (true) {
        let playerGiveIndices = [];
        playerGives.forEach((value, index) => {
          if (value) {playerGiveIndices.push(index);}
        });
        let opponentGiveIndices = [];
        opponentGives.forEach((value, index) => {
          if (value) {opponentGiveIndices.push(index);}
        });
        if (playerGiveIndices.length === 0 || opponentGiveIndices.length === 0) break;
        const playerCancelIndex = Math.floor(Math.random() * playerGiveIndices.length);
        const opponentCancelIndex = Math.floor(Math.random() * opponentGiveIndices.length);
        playerGives[playerGiveIndices[playerCancelIndex]] = false;
        opponentGives[opponentGiveIndices[opponentCancelIndex]] = false;
      }
      // give
      let playerSlots = [];
      let opponentSlots = [];
      newPlayerDeck.forEach((deckCard, index) => {
        if (!deckCard || !characterExists(deckCard[0])) {
          playerSlots.push(index);
        }
      });
      newOpponentDeck.forEach((deckCard, index) => {
        if (!deckCard || !characterExists(deckCard[0])) {
          opponentSlots.push(index);
        }
      });
      playerGives.forEach((value, index) => {
        if (value && opponentSlots.length > 0) {
          const slotIndex = Math.floor(Math.random() * opponentSlots.length);
          const slot = opponentSlots[slotIndex];
          newOpponentDeck[slot] = newPlayerDeck[index];
          newPlayerDeck[index] = null;
          opponentSlots.splice(slotIndex, 1);
        }
      });
      opponentGives.forEach((value, index) => {
        if (value && playerSlots.length > 0) {
          const slotIndex = Math.floor(Math.random() * playerSlots.length);
          const slot = playerSlots[slotIndex];
          newPlayerDeck[slot] = newOpponentDeck[index];
          newOpponentDeck[index] = null;
          playerSlots.splice(slotIndex, 1);
        }
      });
      setDeckInfo({
        playerDeck: newPlayerDeck,
        opponentDeck: newOpponentDeck,
      });
    }
  }

  function newRound() {
    console.log("New round");
    // if opponentTimeout is set, clear it
    if (roundInfo.opponentTimeoutSet) {
      clearTimeout(roundInfo.opponentTimeout);
    }
    let opponentTimeout = null;
    if (hasOpponent && !gameFinished) {
      const clickTime = randomizeOpponentClickTime();
      console.log("New round: Opponent click in " + clickTime + "ms");
      opponentTimeout = setTimeout(simulateOpponentClick, clickTime);
    }
    setRoundInfo({
      opponentTimeoutSet: true,
      opponentTimeout: opponentTimeout,
      opponentMistaken: [],
      playerMistaken: [],
      foundBy: 0,
    });
  }

  const nextMusicCallback = () => {
    if (!gameStarted) return;
    console.log("Next music callback, paused = " + globalState.playbackState.paused);
    if (!globalState.playbackState.paused) {
      newRound();
    } else {
      resetRoundInfo();
    }
  };

  const startGame = () => {
    globalMethods.reroll(true);
    setGameInfo({
      gameStarted: true,
      playerObtained: [],
      opponentObtained: [],
    });
    resetRoundInfo();
  }

  const stopGame = () => {
    setGameInfo({
      gameStarted: false,
      playerObtained: [],
      opponentObtained: [],
    });
    resetRoundInfo();
  }

  globalMethods.registerNextMusicCallback(nextMusicCallback);

  return <Box width="100%" padding={1}>
    <Paper 
      ref={canvasRef}
      variant="outlined"
      sx={{
        width: "100%",
        height: canvasHeight,
        position: "relative",
        overflow: "hidden",
        transition: "height 0.5s",
      }}
    >
      {renderedCards}
      {slider}

      {/* Buttons */}

      {createButton("deckSmallerButton",
        <DeckSmallerIcon sx={{fontSize: "1em"}}></DeckSmallerIcon>, 
        deckLeft + deckWidthPixels + canvasSpacing, playerDeckTop,
        () => {
          setLayoutInfo({
            ...layoutInfo,
            deckCanvasRatio: layoutInfo.deckCanvasRatio - 0.025
          });
        },
        layoutInfo.deckCanvasRatio <= 0.5
      )}
      {createButton("deckLargerButton",
        <DeckLargerIcon sx={{fontSize: "1em"}}></DeckLargerIcon>, 
        deckLeft + deckWidthPixels + canvasSpacing * 2 + buttonSize, playerDeckTop,
        () => {
          setLayoutInfo({
            ...layoutInfo,
            deckCanvasRatio: layoutInfo.deckCanvasRatio + 0.025
          });
          console.log("deckCanvasRatio", layoutInfo.deckCanvasRatio);
        },
        layoutInfo.deckCanvasRatio >= 0.9
      )}
      {createText("deckSizeText", 
        "卡牌尺寸", 
        deckLeft + deckWidthPixels + canvasSpacing, playerDeckTop + buttonSize + canvasSpacing,
        gameStarted, false
      )}
      {createButton("increaseDeckWidthButton",
        <AddIcon sx={{fontSize: "1em"}}></AddIcon>, 
        !gameStarted ? (deckLeft + deckWidthPixels + canvasSpacing) : (canvasWidth + canvasSpacing),
        playerDeckBottom - buttonSize,
        () => {
          setLayoutInfo({
            ...layoutInfo,
            deckWidth: layoutInfo.deckWidth + 1
          });
        },
        gameStarted || layoutInfo.deckWidth >= 15
      )}
      {createButton("decreaseDeckWidthButton",
        <RemoveIcon sx={{fontSize: "1em"}}></RemoveIcon>, 
        !gameStarted ? (deckLeft + deckWidthPixels + canvasSpacing) : (canvasWidth + canvasSpacing),
        playerDeckBottom - buttonSize * 2 - canvasSpacing,
        () => {
          setLayoutInfo({
            ...layoutInfo,
            deckWidth: layoutInfo.deckWidth - 1
          });
        },
        gameStarted || (layoutInfo.deckWidth <= 1),
        "warning"
      )}
      {createButton("increaseDeckHeightButton",
        <AddIcon sx={{fontSize: "1em"}}></AddIcon>, 
        deckLeft + deckWidthPixels - buttonSize, 
        !gameStarted ? (playerDeckBottom + canvasSpacing) : (canvasHeight + canvasSpacing),
        () => {
          setLayoutInfo({
            ...layoutInfo,
            deckHeight: layoutInfo.deckHeight + 1
          });
        },
        gameStarted || layoutInfo.deckHeight >= 5
      )}
      {createButton("decreaseDeckHeightButton",
        <RemoveIcon sx={{fontSize: "1em"}}></RemoveIcon>, 
        deckLeft + deckWidthPixels - buttonSize * 2 - canvasSpacing, 
        !gameStarted ? (playerDeckBottom + canvasSpacing) : (canvasHeight + canvasSpacing),
        () => {
          setLayoutInfo({
            ...layoutInfo,
            deckHeight: layoutInfo.deckHeight - 1
          });
        },
        gameStarted || layoutInfo.deckHeight <= 1,
        "warning"
      )}
      {createText("deckCardNumberText", 
        "卡牌数量", 
        deckLeft + deckWidthPixels + canvasSpacing, 
        !gameStarted ? (playerDeckBottom + canvasSpacing) : (canvasHeight + canvasSpacing),
        false, false
      )}
      {createButton("randomFillOpponentDeck",
        <ShuffleIcon sx={{fontSize: "1em"}}></ShuffleIcon>,
        !gameStarted ? opponentEnabledButtonLeft : (-canvasSpacing - buttonSize), 
        hasOpponent ? (opponentDeckBottom - buttonSize * 2 - canvasSpacing) : opponentEnabledButtonTop,
        () => {
          let selectableCharacters = getSelectableCharacters();
          let newOpponentDeck = deckInfo.opponentDeck.slice();
          for (let i = 0; i < newOpponentDeck.length; i++) {
            if (selectableCharacters.length === 0) { break; }
            if (newOpponentDeck[i] === null || !characterExists(newOpponentDeck[i][0])) {
              const randomIndex = Math.floor(Math.random() * selectableCharacters.length);
              const randomCharacter = selectableCharacters[randomIndex];
              const cardList = data.data[randomCharacter]["card"];
              if (typeof cardList === "string") {
                newOpponentDeck[i] = [randomCharacter, 0];
              } else {
                const randomCardIndex = Math.floor(Math.random() * cardList.length);
                newOpponentDeck[i] = [randomCharacter, randomCardIndex];
              }
              selectableCharacters.splice(randomIndex, 1);
            }
          }
          setDeckInfo({
            ...deckInfo,
            opponentDeck: newOpponentDeck,
          });
        },
        gameStarted || !hasOpponent || opponentDeckFull, "primary", true
      )}
      {createText("randomFillOpponentText", 
        "随机", 
        !gameStarted ? (opponentEnabledButtonLeft - canvasSpacing) : (-canvasSpacing * 2 - buttonSize), 
        hasOpponent ? (opponentDeckBottom - buttonSize * 2 - canvasSpacing) : opponentEnabledButtonTop,
        !hasOpponent, true
      )}
      {createButton("clearOpponentDeck",
        <ClearIcon sx={{fontSize: "1em"}}></ClearIcon>,
        !gameStarted ? opponentEnabledButtonLeft : (-canvasSpacing - buttonSize), 
        hasOpponent ? (opponentDeckBottom - buttonSize * 3 - canvasSpacing * 2) : opponentEnabledButtonTop,
        () => {
          let newOpponentDeck = Array(layoutInfo.deckWidth * layoutInfo.deckHeight).fill(null);
          setDeckInfo({
            ...deckInfo,
            opponentDeck: newOpponentDeck,
          });
        },
        gameStarted || !hasOpponent || opponentDeckEmpty, "error", true
      )}
      {createText("clearFillOpponentText", 
        "清空", 
        !gameStarted ? (opponentEnabledButtonLeft - canvasSpacing) : (-canvasSpacing * 2 - buttonSize), 
        hasOpponent ? (opponentDeckBottom - buttonSize * 3 - canvasSpacing * 2) : opponentEnabledButtonTop,
        !hasOpponent, true
      )}
      {createButton("shuffleOpponentDeck",
        <RefreshIcon sx={{fontSize: "1em"}}></RefreshIcon>,
        !gameStarted ? opponentEnabledButtonLeft : (-canvasSpacing - buttonSize), 
        hasOpponent ? (opponentDeckBottom - buttonSize * 4 - canvasSpacing * 3) : opponentEnabledButtonTop,
        () => {
          let newOpponentDeck = deckInfo.opponentDeck.slice();
          for (let i = newOpponentDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newOpponentDeck[i], newOpponentDeck[j]] = [newOpponentDeck[j], newOpponentDeck[i]];
          }
          setDeckInfo({
            ...deckInfo,
            opponentDeck: newOpponentDeck,
          });
        },
        gameStarted || !hasOpponent || opponentDeckEmpty, "warning", true
      )}
      {createText("shuffleOpponentText", 
        "乱序", 
        !gameStarted ? (opponentEnabledButtonLeft - canvasSpacing) : (-canvasSpacing * 2 - buttonSize), 
        hasOpponent ? (opponentDeckBottom - buttonSize * 4 - canvasSpacing * 3) : opponentEnabledButtonTop,
        !hasOpponent, true
      )}
      {createButton("randomFillPlayerDeck",
        <ShuffleIcon sx={{fontSize: "1em"}}></ShuffleIcon>,
        !gameStarted ? opponentEnabledButtonLeft : (-canvasSpacing - buttonSize), 
        playerDeckTop + (hasOpponent ? 0 : canvasSpacing + buttonSize),
        () => {
          let selectableCharacters = getSelectableCharacters();
          let newPlayerDeck = deckInfo.playerDeck.slice();
          for (let i = 0; i < newPlayerDeck.length; i++) {
            if (selectableCharacters.length === 0) { break; }
            if (newPlayerDeck[i] === null || !characterExists(newPlayerDeck[i][0])) {
              const randomIndex = Math.floor(Math.random() * selectableCharacters.length);
              const randomCharacter = selectableCharacters[randomIndex];
              const cardList = data.data[randomCharacter]["card"];
              if (typeof cardList === "string") {
                newPlayerDeck[i] = [randomCharacter, 0];
              } else {
                const randomCardIndex = Math.floor(Math.random() * cardList.length);
                newPlayerDeck[i] = [randomCharacter, randomCardIndex];
              }
              selectableCharacters.splice(randomIndex, 1);
            }
          }
          setDeckInfo({
            ...deckInfo,
            playerDeck: newPlayerDeck,
          });
        },
        gameStarted || playerDeckFull, "primary"
      )}
      {createText("randomFillPlayerText", 
        "随机", 
        !gameStarted ? (opponentEnabledButtonLeft - canvasSpacing) : (-canvasSpacing * 2 - buttonSize), 
        playerDeckTop + (hasOpponent ? 0 : canvasSpacing + buttonSize),
        false, true
      )}
      {createButton("clearPlayerDeck",
        <ClearIcon sx={{fontSize: "1em"}}></ClearIcon>,
        !gameStarted ? opponentEnabledButtonLeft : (-canvasSpacing - buttonSize), 
        playerDeckTop + buttonSize + canvasSpacing + (hasOpponent ? 0 : canvasSpacing + buttonSize),
        () => {
          let newPlayerDeck = Array(layoutInfo.deckWidth * layoutInfo.deckHeight).fill(null);
          setDeckInfo({
            ...deckInfo,
            playerDeck: newPlayerDeck,
          });
        },
        gameStarted || playerDeckEmpty, "error"
      )}
      {createText("clearFillPlayerText", 
        "清空", 
        !gameStarted ? (opponentEnabledButtonLeft - canvasSpacing) : (-canvasSpacing * 2 - buttonSize), 
        playerDeckTop + buttonSize + canvasSpacing + (hasOpponent ? 0 : canvasSpacing + buttonSize),
        false, true
      )}
      {createButton("shufflePlayerDeck",
        <RefreshIcon sx={{fontSize: "1em"}}></RefreshIcon>,
        !gameStarted ? opponentEnabledButtonLeft : (-canvasSpacing - buttonSize), 
        playerDeckTop + buttonSize * 2 + canvasSpacing * 2 + (hasOpponent ? 0 : canvasSpacing + buttonSize),
        () => {
          let newPlayerDeck = deckInfo.playerDeck.slice();
          for (let i = newPlayerDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newPlayerDeck[i], newPlayerDeck[j]] = [newPlayerDeck[j], newPlayerDeck[i]];
          }
          setDeckInfo({
            ...deckInfo,
            playerDeck: newPlayerDeck,
          });
        },
        gameStarted || playerDeckEmpty, "warning", true
      )}
      {createText("shufflePlayerText", 
        "乱序", 
        !gameStarted ? (opponentEnabledButtonLeft - canvasSpacing) : (-canvasSpacing * 2 - buttonSize), 
        playerDeckTop + buttonSize * 2 + canvasSpacing * 2 + (hasOpponent ? 0 : canvasSpacing + buttonSize),
        false, true
      )}
      {createButton("startGame",
        !gameStarted ? <PlayIcon sx={{fontSize: "1em"}}></PlayIcon> : <StopIcon sx={{fontSize: "1em"}}></StopIcon>,
        opponentEnabledButtonLeft, 
        gameStarted ? playerDeckTop : playerDeckTop + buttonSize * 3 + canvasSpacing * 3 + (!hasOpponent ? (canvasSpacing + buttonSize) : 0),
        () => {
          globalMethods.userPause();
          if (!gameStarted) {
            startGame();
          } else {
            stopGame();
          }
        },
        (!gameStarted) ? (!(playerDeckFull && (!hasOpponent || opponentDeckFull))) : (false), !gameStarted ? "success" : "error"
      )}
      {createText("playButtonText", 
        !gameStarted ? "开始游戏" : "结束游戏", 
        opponentEnabledButtonLeft - canvasSpacing, 
        gameStarted ? playerDeckTop : playerDeckTop + buttonSize * 3 + canvasSpacing * 3 + (!hasOpponent ? (canvasSpacing + buttonSize) : 0),
        gameStarted, true
      )}
      {<Box
        key="opponentEnabledButton"
        sx={{
          ...iconButtonProperties.boxStyle,
          left: !gameStarted ? opponentEnabledButtonLeft : (-canvasSpacing - buttonSize), 
          top: opponentEnabledButtonTop,
          "&:hover": null,
          backgroundColor: layoutInfo.hasOpponent ? "primary.main" : "black",
        }}
        onClick={() => {
          if (gameStarted) {return;}
          setLayoutInfo({
            ...layoutInfo,
            hasOpponent: !layoutInfo.hasOpponent
          });
        }}
      >
        <OpponentIcon sx={{
          color: layoutInfo.hasOpponent ? "black" : "primary.main",
          fontSize: "1em"
        }}></OpponentIcon>
      </Box>}
      {createText("opponentEnabledText", 
        "对手", 
        !gameStarted ? (opponentEnabledButtonLeft - canvasSpacing) : (-canvasSpacing * 2 - buttonSize), 
        opponentEnabledButtonTop,
        false, true
      )}
      {<TextField sx={{
          ...textfieldStyles,
          left: (gameStarted || !hasOpponent) ? canvasWidth + canvasSpacing : deckLeft + deckWidthPixels + canvasSpacing,
          top: opponentDeckTop,
        }}
        key="timeAverageTextField"
        size="small"
        label="平均反应时间"
        className="chinese"
        inputProps={{min: 1, max: 20, step: 0.5}}
        disabled={gameStarted}
        type="number"
        value={opponentSettings.timeAverage}
        onChange={(e) => {
          setOpponentSettings({
            ...opponentSettings,
            timeAverage: parseFloat(e.target.value),
          });
        }}
      >
      </TextField>}
      {<TextField sx={{
          ...textfieldStyles,
          left: (gameStarted || !hasOpponent) ? canvasWidth + canvasSpacing : deckLeft + deckWidthPixels + canvasSpacing,
          top: opponentDeckTop + textfieldHeight + canvasSpacing,
        }}
        size="small"
        label="时间波动"
        className="chinese"
        type="number"
        value={opponentSettings.timeDeviation}
        inputProps={{min: 0, max: 10, step: 0.5}}
        disabled={gameStarted}
        onChange={(e) => {
          setOpponentSettings({
            ...opponentSettings,
            timeDeviation: parseFloat(e.target.value)
          });
        }}
      >
      </TextField>}
      {<TextField sx={{
          ...textfieldStyles,
          left: (gameStarted || !hasOpponent) ? canvasWidth + canvasSpacing : deckLeft + deckWidthPixels + canvasSpacing,
          top: opponentDeckTop + textfieldHeight * 2 + canvasSpacing * 2,
        }}
        size="small"
        label="犯错概率"
        className="chinese"
        type="number"
        value={opponentSettings.mistakeRate}
        inputProps={{min: 0, max: 1, step: 0.1}}
        disabled={gameStarted}
        onChange={(e) => {
          setOpponentSettings({
            ...opponentSettings,
            mistakeRate: parseFloat(e.target.value),
          });
        }}
      >
      </TextField>}
      
      {<Box
        key="traditionalModeButton"
        sx={{
          ...iconButtonProperties.boxStyle,
          left: (gameStarted || !hasOpponent) ? canvasWidth + canvasSpacing : deckLeft + deckWidthPixels + canvasSpacing,
          top: opponentDeckTop + textfieldHeight * 3 + canvasSpacing * 3,
          "&:hover": null,
          backgroundColor: !opponentSettings.traditionalMode ? "primary.main" : "black",
        }}
        onClick={() => {
          if (gameStarted) {return;}
          setOpponentSettings({
            ...opponentSettings,
            traditionalMode: !opponentSettings.traditionalMode
          });
        }}
      >
        <TraditionalIcon sx={{
          color: !opponentSettings.traditionalMode ? "black" : "primary.main",
          fontSize: "1em"
        }}></TraditionalIcon>
      </Box>}
      {createText("traditionalModeText", 
        (!opponentSettings.traditionalMode) ? "自由模式" : "传统模式", 
        ((gameStarted || !hasOpponent) ? canvasWidth + canvasSpacing : deckLeft + deckWidthPixels + canvasSpacing) + buttonSize + canvasSpacing,
        opponentDeckTop + textfieldHeight * 3 + canvasSpacing * 3,
        false, false, {
          width: canvasWidth - (deckLeft + deckWidthPixels + canvasSpacing + canvasMargin),
          textAlign: "left",
        }
      )}
      {createText("traditionalModeDescriptionText", 
        ((!opponentSettings.traditionalMode)
          ? "卡片归属方不会变动，游戏结束时持有卡牌多者获胜。"
          : "卡片归属方会变动，正确选择将减少本方卡片，错误选择增加本方卡片，先清空本方卡片者获胜。"
        ),
         
        (gameStarted || !hasOpponent) ? canvasWidth + canvasSpacing : deckLeft + deckWidthPixels + canvasSpacing,
        opponentDeckTop + textfieldHeight * 3 + canvasSpacing * 4 + buttonSize,
        false, false, {
          width: canvasWidth - (deckLeft + deckWidthPixels + canvasSpacing + canvasMargin),
          textAlign: "left",
        }
      )}
      {createText("playerObtainedText",
        playerObtained.length.toString(),
        gameStarted ? (canvasWidth - canvasMargin - cardWidth) : (canvasWidth + canvasSpacing),
        playerObtainedTop,
        false, false, {
          fontFamily: "Georgia, serif",
          fontSize: cardWidth * 0.45 + "px",
          width: cardWidth,
          height: cardHeight,
          textAlign: "center",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }
      )}
      {createText("opponentObtainedText",
        opponentObtained.length.toString(),
        (hasOpponent && gameStarted) ? (canvasMargin) : (-cardWidth - canvasSpacing),
        opponentObtainedTop,
        false, false, {
          fontFamily: "Georgia, serif",
          fontSize: cardWidth * 0.45 + "px",
          width: cardWidth,
          height: cardHeight,
          textAlign: "center",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }
      )}
      {<Box sx={{
        position: "absolute",
        left: gameStarted ? (clientWidth - playControlsWidth) / 2 : canvasWidth + canvasSpacing,
        top: playerDeckTop - canvasSpacing - middlebandHeight,
        transition: "top 0.5s, left 0.5s",
      }}>
        <PlayControls
          onPreviousClick={globalMethods.onPreviousMusicClick}
          onNextClick={() => {
            globalMethods.onNextMusicClick();
            settleRound();
          }}
          onPauseClick={() => {
            globalMethods.onPauseMusicClick();
            if (!roundInfo.opponentTimeoutSet) {
              const playbackState = globalState.playbackState;
              if (playbackState.paused || playbackState.playbackPaused) {
                newRound();
              }
            }
          }}
          globalState={globalState}
        ></PlayControls>
      </Box>}
    </Paper>
  </Box>
  
}
GameSimulatorPanel.displayName = "GameSimulatorPanel";

export default GameSimulatorPanel;