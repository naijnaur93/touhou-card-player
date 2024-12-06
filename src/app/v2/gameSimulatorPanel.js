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

const GameSimulatorPanel = ({ data, globalState, globalMethods }) => {

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
  const canvasSpacing = 8;
  const cards = {};
  const cardAspectRatio = 703 / 1000;
  const cardSpacing = canvasSpacing;
  const clientWidth = canvasRef.current ? canvasRef.current.clientWidth : 0;
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
  const middlebandCardHeight = 0.8 * cardHeight;
  let middlebandHeight = middlebandCardHeight * (1 + 0.1) + sliderHeight + canvasSpacing;
  if (gameStarted) {
    middlebandHeight = 59;
  }
  const playControlsWidth = 209;
  const opponentDeckTop = canvasMargin;
  const opponentDeckBottom = opponentDeckTop + (!hasOpponent ? 0 : cardHeight * layoutInfo.deckHeight + cardSpacing * (layoutInfo.deckHeight - 1));
  let middlebandTop = opponentDeckBottom + (!hasOpponent ? 0 : canvasSpacing);
  const playerDeckTop = middlebandTop + middlebandHeight + canvasSpacing;
  const playerDeckBottom = playerDeckTop + cardHeight * layoutInfo.deckHeight + cardSpacing * (layoutInfo.deckHeight - 1);
  let canvasHeight = playerDeckBottom + canvasMargin;
  const buttonSize = 24;
  if (!gameStarted) {
    canvasHeight += canvasSpacing + buttonSize;
  }
  const characterCount = Object.keys(data.data).length;

  // calculate card positioning and size infos
  let cardRenderInfos = {};
  let cardPlaceholderInfos = [];
  
  Object.entries(data.data).forEach(([character, characterData]) => {
    if (globalState.musicPlayerState.musicIds[character] === -1) {return;}
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
      }
      characterCardInfos.push(cardRenderInfo);
    });
    cardRenderInfos[character] = characterCardInfos;
  });

  deckInfo.playerDeck.forEach((deckCard, index) => {
    const left = deckLeft + (index % layoutInfo.deckWidth) * (cardWidth + cardSpacing);
    const top = playerDeckTop + Math.floor(index / layoutInfo.deckWidth) * (cardHeight + cardSpacing);
    if (deckCard == null) {
      cardPlaceholderInfos.push({
        key: "placeholder" + cardPlaceholderInfos.length,
        left, top, width: cardWidth, height: cardHeight,
      })
    } else {
      const [character, cardIndex] = deckCard;
      const cardRenderInfo = cardRenderInfos[character][cardIndex];
      cardRenderInfo.left = left;
      cardRenderInfo.top = top;
      cardRenderInfo.width = cardWidth;
      cardRenderInfo.zIndex = 1; // for those with the same character but not same cardIndex, zIndex = 0 so that it is hidden
      cardRenderInfo.assigned = true;
      cardRenderInfo.paperStyles["&:hover"] = {
        backgroundColor: "lightcyan",
      }
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
      if (deckCard == null) {
        cardPlaceholderInfos.push({
          key: "placeholder" + cardPlaceholderInfos.length,
          left, top, width: cardWidth, height: cardHeight,
        })
      } else {
        const [character, cardIndex] = deckCard;
        const cardRenderInfo = cardRenderInfos[character][cardIndex];
        cardRenderInfo.left = left;
        cardRenderInfo.top = top;
        cardRenderInfo.width = cardWidth;
        cardRenderInfo.reversed = true;
        cardRenderInfo.zIndex = 1;
        cardRenderInfo.assigned = true;
        cardRenderInfo.paperStyles["&:hover"] = {
          backgroundColor: "lightcyan",
        }
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

  // for those not assigned
  if (!gameStarted) { // the cards are placed in the middleband to be selected
    let counter = 0;
    const cardHeight = middlebandCardHeight;
    const cardWidth = cardHeight * cardAspectRatio;
    const cardOverlap = cardWidth * 0.15;
    const canSelectMoreCards = deckInfo.playerDeck.includes(null) || (layoutInfo.hasOpponent && deckInfo.opponentDeck.includes(null));
    Object.entries(cardRenderInfos).forEach(([character, characterCardInfos]) => {
      characterCardInfos.forEach((cardRenderInfo) => {
        if (!cardRenderInfo.assigned) {
          cardRenderInfo.left = deckLeft + counter * (cardWidth - cardOverlap);
          cardRenderInfo.top = middlebandTop + cardHeight * 0.1;
          cardRenderInfo.width = cardWidth;
          if (canSelectMoreCards) {cardRenderInfo.props["onClick"] = () => {
            // if playerDeck has null value, assign the card to it; or if opponentDeck has null value, assign the card to it
            let index = deckInfo.playerDeck.indexOf(null);
            if (index >= 0) {
              let newPlayerDeck = deckInfo.playerDeck.slice();
              newPlayerDeck[index] = [character, cardRenderInfo.cardIndex];
              setDeckInfo({
                ...deckInfo,
                playerDeck: newPlayerDeck,
              });
            } else if (layoutInfo.hasOpponent) {
              let index = deckInfo.opponentDeck.indexOf(null);
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
  if (!gameStarted) {
    const sliderTop = middlebandTop + middlebandCardHeight * 1.1 + canvasSpacing;
    slider = <Slider 
      key="slider"
      size="small" sx={{
        width: deckWidthPixels - 20,
        top: sliderTop,
        left: deckLeft + 10,
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
            transition: "background-color 0.5s, transform 0.5s",
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

  function createText(key, text, x, y, hidden=false, positionedWithRight=false) {
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

  const opponentEnabledButtonLeft = deckLeft - buttonSize - canvasSpacing;
  const opponentEnabledButtonTop = hasOpponent ? opponentDeckBottom - buttonSize : playerDeckTop
  const opponentDeckSelectedCount = deckInfo.opponentDeck.filter((card) => card !== null).length;
  const opponentDeckFilled = opponentDeckSelectedCount === deckInfo.opponentDeck.length;
  const opponentDeckEmpty = opponentDeckSelectedCount === 0;
  const playerDeckSelectedCount = deckInfo.playerDeck.filter((card) => card !== null).length;
  const playerDeckFilled = playerDeckSelectedCount === deckInfo.playerDeck.length;
  const playerDeckEmpty = playerDeckSelectedCount === 0;

  const nextMusicCallback = () => {
    console.log("nextMusicCallback");
    if (!gameStarted) return;
  };

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
      {!gameStarted && createButton("increaseDeckWidthButton",
        <AddIcon sx={{fontSize: "1em"}}></AddIcon>, 
        deckLeft + deckWidthPixels + canvasSpacing, playerDeckBottom - buttonSize,
        () => {
          setLayoutInfo({
            ...layoutInfo,
            deckWidth: layoutInfo.deckWidth + 1
          });
        },
        layoutInfo.deckWidth >= 15
      )}
      {!gameStarted && createButton("decreaseDeckWidthButton",
        <RemoveIcon sx={{fontSize: "1em"}}></RemoveIcon>, 
        deckLeft + deckWidthPixels + canvasSpacing, playerDeckBottom - buttonSize * 2 - canvasSpacing,
        () => {
          setLayoutInfo({
            ...layoutInfo,
            deckWidth: layoutInfo.deckWidth - 1
          });
        },
        layoutInfo.deckWidth <= 1,
        "warning"
      )}
      {!gameStarted && createButton("increaseDeckHeightButton",
        <AddIcon sx={{fontSize: "1em"}}></AddIcon>, 
        deckLeft + deckWidthPixels - buttonSize, playerDeckBottom + canvasSpacing,
        () => {
          setLayoutInfo({
            ...layoutInfo,
            deckHeight: layoutInfo.deckHeight + 1
          });
        },
        layoutInfo.deckHeight >= 5
      )}
      {!gameStarted && createButton("decreaseDeckHeightButton",
        <RemoveIcon sx={{fontSize: "1em"}}></RemoveIcon>, 
        deckLeft + deckWidthPixels - buttonSize * 2 - canvasSpacing, playerDeckBottom + canvasSpacing,
        () => {
          setLayoutInfo({
            ...layoutInfo,
            deckHeight: layoutInfo.deckHeight - 1
          });
        },
        layoutInfo.deckHeight <= 1,
        "warning"
      )}
      {!gameStarted && createText("deckCardNumberText", 
        "卡牌数量", 
        deckLeft + deckWidthPixels + canvasSpacing, playerDeckBottom + canvasSpacing,
        gameStarted, false
      )}
      {!gameStarted && createButton("randomFillOpponentDeck",
        <ShuffleIcon sx={{fontSize: "1em"}}></ShuffleIcon>,
        opponentEnabledButtonLeft, hasOpponent ? (opponentDeckBottom - buttonSize * 2 - canvasSpacing) : opponentEnabledButtonTop,
        () => {
          let selectableCharacters = getSelectableCharacters();
          let newOpponentDeck = deckInfo.opponentDeck.slice();
          for (let i = 0; i < newOpponentDeck.length; i++) {
            if (selectableCharacters.length === 0) { break; }
            if (newOpponentDeck[i] === null) {
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
        !hasOpponent || opponentDeckFilled, "primary", true
      )}
      {!gameStarted && createText("randomFillOpponentText", 
        "随机", 
        opponentEnabledButtonLeft - canvasSpacing, hasOpponent ? (opponentDeckBottom - buttonSize * 2 - canvasSpacing) : opponentEnabledButtonTop,
        !hasOpponent, true
      )}
      {!gameStarted && createButton("clearOpponentDeck",
        <ClearIcon sx={{fontSize: "1em"}}></ClearIcon>,
        opponentEnabledButtonLeft, hasOpponent ? (opponentDeckBottom - buttonSize * 3 - canvasSpacing * 2) : opponentEnabledButtonTop,
        () => {
          let newOpponentDeck = Array(layoutInfo.deckWidth * layoutInfo.deckHeight).fill(null);
          setDeckInfo({
            ...deckInfo,
            opponentDeck: newOpponentDeck,
          });
        },
        !hasOpponent || opponentDeckEmpty, "error", true
      )}
      {!gameStarted && createText("clearFillOpponentText", 
        "清空", 
        opponentEnabledButtonLeft - canvasSpacing, hasOpponent ? (opponentDeckBottom - buttonSize * 3 - canvasSpacing * 2) : opponentEnabledButtonTop,
        !hasOpponent, true
      )}
      {!gameStarted && createButton("shuffleOpponentDeck",
        <RefreshIcon sx={{fontSize: "1em"}}></RefreshIcon>,
        opponentEnabledButtonLeft, hasOpponent ? (opponentDeckBottom - buttonSize * 4 - canvasSpacing * 3) : opponentEnabledButtonTop,
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
        !hasOpponent || opponentDeckEmpty, "warning", true
      )}
      {!gameStarted && createText("shuffleOpponentText", 
        "乱序", 
        opponentEnabledButtonLeft - canvasSpacing, hasOpponent ? (opponentDeckBottom - buttonSize * 4 - canvasSpacing * 3) : opponentEnabledButtonTop,
        !hasOpponent, true
      )}
      {!gameStarted && createButton("randomFillPlayerDeck",
        <ShuffleIcon sx={{fontSize: "1em"}}></ShuffleIcon>,
        opponentEnabledButtonLeft, playerDeckTop + (hasOpponent ? 0 : canvasSpacing + buttonSize),
        () => {
          let selectableCharacters = getSelectableCharacters();
          let newPlayerDeck = deckInfo.playerDeck.slice();
          for (let i = 0; i < newPlayerDeck.length; i++) {
            if (selectableCharacters.length === 0) { break; }
            if (newPlayerDeck[i] === null) {
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
        playerDeckFilled, "primary"
      )}
      {!gameStarted && createText("randomFillPlayerText", 
        "随机", 
        opponentEnabledButtonLeft - canvasSpacing, playerDeckTop + (hasOpponent ? 0 : canvasSpacing + buttonSize),
        false, true
      )}
      {!gameStarted && createButton("clearPlayerDeck",
        <ClearIcon sx={{fontSize: "1em"}}></ClearIcon>,
        opponentEnabledButtonLeft, playerDeckTop + buttonSize + canvasSpacing + (hasOpponent ? 0 : canvasSpacing + buttonSize),
        () => {
          let newPlayerDeck = Array(layoutInfo.deckWidth * layoutInfo.deckHeight).fill(null);
          setDeckInfo({
            ...deckInfo,
            playerDeck: newPlayerDeck,
          });
        },
        playerDeckEmpty, "error"
      )}
      {!gameStarted && createText("clearFillPlayerText", 
        "清空", 
        opponentEnabledButtonLeft - canvasSpacing, playerDeckTop + buttonSize + canvasSpacing + (hasOpponent ? 0 : canvasSpacing + buttonSize),
        false, true
      )}
      {!gameStarted && createButton("shufflePlayerDeck",
        <RefreshIcon sx={{fontSize: "1em"}}></RefreshIcon>,
        opponentEnabledButtonLeft, playerDeckTop + buttonSize * 2 + canvasSpacing * 2 + (hasOpponent ? 0 : canvasSpacing + buttonSize),
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
        playerDeckEmpty, "warning", true
      )}
      {!gameStarted && createText("shufflePlayerText", 
        "乱序", 
        opponentEnabledButtonLeft - canvasSpacing, playerDeckTop + buttonSize * 2 + canvasSpacing * 2 + (hasOpponent ? 0 : canvasSpacing + buttonSize),
        false, true
      )}
      {createButton("startGame",
        !gameStarted ? <PlayIcon sx={{fontSize: "1em"}}></PlayIcon> : <StopIcon sx={{fontSize: "1em"}}></StopIcon>,
        opponentEnabledButtonLeft, gameStarted ? playerDeckTop : playerDeckTop - buttonSize - canvasSpacing - 2,
        () => {
          if (!gameStarted) {
            globalMethods.reroll(true);
            setGameInfo({
              gameStarted: true,
            });
          } else {
            setGameInfo({
              gameStarted: false,
            });
          }
        },
        (!gameStarted) ? (!(playerDeckFilled && (!hasOpponent || opponentDeckFilled))) : (false), !gameStarted ? "success" : "error"
      )}
      {createText("playButtonText", 
        !gameStarted ? "开始游戏" : "结束游戏", 
        opponentEnabledButtonLeft - canvasSpacing, gameStarted ? playerDeckTop : playerDeckTop - buttonSize - canvasSpacing - 2,
        false, true
      )}
      {!gameStarted && <Box
        key="opponentEnabledButton"
        sx={{
          ...iconButtonProperties.boxStyle,
          left: opponentEnabledButtonLeft,
          top: opponentEnabledButtonTop,
          "&:hover": null,
          backgroundColor: layoutInfo.hasOpponent ? "primary.main" : "black",
        }}
        onClick={() => {
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
      {!gameStarted && createText("opponentEnabledText", 
        "对手", 
        opponentEnabledButtonLeft - canvasSpacing, opponentEnabledButtonTop,
        false, true
      )}
      {!gameStarted && <TextField sx={{
          ...textfieldStyles,
          left: deckLeft + deckWidthPixels + canvasSpacing,
          top: hasOpponent ? opponentDeckTop : -textfieldHeight,
        }}
        key="timeAverageTextField"
        size="small"
        label="平均反应时间"
        className="chinese"
        inputProps={{min: 1, max: 20, step: 0.5}}
        type="number"
        value={opponentSettings.timeAverage}
        onChange={(e) => {
          setOpponentSettings({
            ...opponentSettings,
            timeAverage: e.target.value,
          });
        }}
      >
      </TextField>}
      {!gameStarted && <TextField sx={{
          ...textfieldStyles,
          left: deckLeft + deckWidthPixels + canvasSpacing,
          top: hasOpponent ? (opponentDeckTop + textfieldHeight + canvasSpacing) : -textfieldHeight,
        }}
        size="small"
        label="时间波动"
        className="chinese"
        type="number"
        value={opponentSettings.timeDeviation}
        inputProps={{min: 0, max: 10, step: 0.5}}
        onChange={(e) => {
          setOpponentSettings({
            ...opponentSettings,
            timeDeviation: e.target.value,
          });
        }}
      >
      </TextField>}
      {!gameStarted && <TextField sx={{
          ...textfieldStyles,
          left: deckLeft + deckWidthPixels + canvasSpacing,
          top: hasOpponent ? (opponentDeckTop + textfieldHeight * 2 + canvasSpacing * 2) : -textfieldHeight,
        }}
        size="small"
        label="犯错概率"
        className="chinese"
        type="number"
        value={opponentSettings.mistakeRate}
        inputProps={{min: 0, max: 1, step: 0.1}}
        onChange={(e) => {
          setOpponentSettings({
            ...opponentSettings,
            mistakeRate: e.target.value,
          });
        }}
      >
      </TextField>}
      {gameStarted && <Box sx={{
        position: "absolute",
        left: (clientWidth - playControlsWidth) / 2,
        top: opponentDeckBottom + (hasOpponent ? canvasSpacing : 0),
        transition: "top 0.5s, left 0.5s",
      }}>
        <PlayControls
          onPreviousClick={globalMethods.onPreviousMusicClick}
          onNextClick={globalMethods.onNextMusicClick}
          onPauseClick={globalMethods.onPauseMusicClick}
          globalState={globalState}
        ></PlayControls>
      </Box>}
    </Paper>
  </Box>
  
}
GameSimulatorPanel.displayName = "GameSimulatorPanel";

export default GameSimulatorPanel;