import { Collapse, Box } from "@mui/material"

const TransitionTab = ({ index, value, children }) => {
  return (
    <Box key={index} sx={{
      width: "100%",
      position: "relative",
      transition: "transform 0.5s",
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