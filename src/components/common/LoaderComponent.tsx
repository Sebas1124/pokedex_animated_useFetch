import { CircularProgress } from "@mui/material";

import type { CircularProgressProps } from "@mui/material";

interface LoaderComponentProps {
    size?: string;
    color?: CircularProgressProps["color"];
    sx?: CircularProgressProps["sx"];
}

export const LoaderComponent = ({ size = "medium", color = "error", sx }: LoaderComponentProps) => {
  return (
    <CircularProgress
        size={size === "small" ? 20 : size === "large" ? 60 : 40}
        color={color}
        sx={{
          margin: "auto",
          display: "block",
          marginTop: "20px",
          ...sx,
        }}
    />
  )
}
