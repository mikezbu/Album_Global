import { Box, CircularProgress, Typography } from '@mui/material'
import React from 'react'

export interface ILoadingProps {
  size?: number
  position?: string
  message?: string
}

function Loading(props: ILoadingProps) {
  const { size, position, message, ...others } = props

  return (
    <div
      className="inset-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-50"
      style={{ position } as React.CSSProperties}
    >
      <div className="flex flex-col items-center">
        <CircularProgress size={size} {...others} />
        {message && (
          <Typography component="div">
            <Box marginTop="1em" fontWeight="fontWeightRegular">
              {message}
            </Box>
          </Typography>
        )}
      </div>
    </div>
  )
}

Loading.defaultProps = {
  size: 25,
  position: 'fixed',
}

export default Loading
