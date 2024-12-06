import { Collapse, Box } from "@mui/material"

const TransitionTab = ({ index, value, children, transitionTime = 0.5 }) => {
  return (
    <Box key={index} sx={{
      width: "100%",
      position: "relative",
      transition: "transform " + transitionTime + "s",
      transform: `translateX(${(- value) * 100}%)`,
      top: 0,
      display: "inline-block",
      flexShrink: 0,
    }}>
      {children}
    </Box>
  )
}

export default TransitionTab;