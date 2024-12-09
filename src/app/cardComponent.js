'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useRef, useEffect, forwardRef, useState } from "react";

const CardComponent = forwardRef(({
  children,
  src, 
  width = "10%",
  alt = "cardComponent",
  aspectRatio = 703/1000,
  elevation = 0,
  paperProps = {},
  paperStyles = {},
  imageStyles = {},
  noImage = false,
}, ref) => {

  let imageRef = useRef(null);

  useEffect(() => {
    // console.log("useEffect triggered, src: ", src);
    if (imageRef.current) {
      let imageAspectRatio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
      if (imageAspectRatio > aspectRatio) {
        imageRef.current.style.width = "100%";
        imageRef.current.style.height = "auto";
        let topMargin = (1 - aspectRatio / imageAspectRatio) * 50;
        imageRef.current.style.top = topMargin + "%";
        imageRef.current.style.left = 0;
      } else {
        imageRef.current.style.width = "auto";
        imageRef.current.style.height = "100%";
        let leftMargin = (1 - imageAspectRatio / aspectRatio) * 50;
        imageRef.current.style.left = leftMargin + "%";
        imageRef.current.style.top = 0;
      }
    }
  }, [src])

  return (
    <Paper
      sx={{
        backgroundColor: "white",
        width: width,
        ...paperStyles,
      }}
      variant={elevation === 0 ? "outlined" : "elevation"}
      elevation={elevation}
      ref={ref}
      {...paperProps}
    >
      <Box sx={{
        position: "relative",
        width: "100%",
        aspectRatio: aspectRatio,
        justifyContent: "center",
        alignItems: "center",
      }}>
        {!noImage && <img
          src={src} 
          alt={alt}
          ref={imageRef}
          style={{
            width: "100%", 
            height: "auto", 
            position: "absolute", 
            left: 0,
            top: 0,
            objectFit: "cover",
            userSelect: "none",
            ...imageStyles,
          }}
          draggable={false}
        />}
        {children}
      </Box>
    </Paper>
  );
})
CardComponent.displayName = "CardComponent"

export default CardComponent;