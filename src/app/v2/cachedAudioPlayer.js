import { useState, useRef, useEffect } from "react";

// onFetched(src, audioRef) is called when the audio is fetched from remote
// onLoaded(src, audioRef) is called when the audio is loaded into the audio element
const CachedAudioPlayer = ({ src, onFetched, onLoaded }) => {

  const prepared = useRef({})
  const audioRef = useRef(null);
  const [currentSrc, setCurrentSrc] = useState("");
  const currentSrcRef = useRef(currentSrc);

  useEffect(() => {
    currentSrcRef.current = currentSrc;
  }, [currentSrc]);

  function prepareAudio(src) {
    // console.log("calling prepareAudio", src);
    // console.log("current prepared", prepared.current);
    if (prepared.current[src]) {
    //   console.log("already prepared", src);
      return;
    }
    prepared.current[src] = "fetching";
    fetch(src, { cache: "force-cache" }).then(async response => {
      if (!response.ok) {
        console.log("Failed to fetch", src);
        prepared.current[src] = null;
        return;
      }
      let reader = response.body.getReader();
      let chunks = [];
      let done = false;
      let totalSize = 0;
      while (!done) {
        const { done: _done, value } = await reader.read();
        if (value) {
          totalSize += value.length;
          chunks.push(value);
        }
        done = _done;
      }
      // concat chunks
      let concatenatedData = new Uint8Array(totalSize);
      let offset = 0;
      chunks.forEach(chunk => {
        concatenatedData.set(chunk, offset);
        offset += chunk.length;
      });
      prepared.current[src] = new Blob([concatenatedData], { type: "audio/mpeg" });
      if (currentSrcRef.current === src) {
        audioRef.current.src = URL.createObjectURL(prepared.current[src]);
        onFetched(src, audioRef);
      }
      // console.log("prepared dict", prepared.current);
    })
  }

  useEffect(() => {
    if (src !== currentSrc) {
      setCurrentSrc(src);
      if (prepared.current[src] && prepared.current[src] !== "fetching") {
        audioRef.current.src = URL.createObjectURL(prepared.current[src]);
        onFetched(src, audioRef);
      } else {
        prepareAudio(src);
      }
    }
  }, [src]);

  return [
    <div>
      <audio
        ref={audioRef}
        onLoadedData={() => {
          onLoaded(audioRef);
        }}
      />
    </div>, prepareAudio, audioRef
  ]
};

export default CachedAudioPlayer;