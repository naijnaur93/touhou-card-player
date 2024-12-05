'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useRef, useEffect, forwardRef } from "react";

const CardComponent = forwardRef(({
  key, src, 
  width = "10%",
  alt = "cardComponent",
  aspectRatio = 703/1000,
  elevation = 0,
  paperProps = {},
  paperStyles = {},
}, ref) => {

  let imageRef = useRef(null);

  useEffect(() => {
    if (imageRef.current) {
      let imageAspectRatio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
      if (imageAspectRatio > aspectRatio) {
        imageRef.current.style.width = "100%";
        imageRef.current.style.height = "auto";
        let topMargin = (1 - aspectRatio / imageAspectRatio) * 50;
        imageRef.current.style.top = topMargin + "%";
      } else {
        imageRef.current.style.width = "auto";
        imageRef.current.style.height = "100%";
        let leftMargin = (1 - imageAspectRatio / aspectRatio) * 50;
        imageRef.current.style.left = leftMargin + "%";
      }
    }
  })

  return (
    <Paper key={key}
      style={{
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
        <img key={key} 
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
          }}
        />
      </Box>
    </Paper>
  );
})

export default CardComponent;