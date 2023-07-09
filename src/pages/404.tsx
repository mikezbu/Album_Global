import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import BlankLayout from 'src/common/components/layout/BlankLayout'

const Page = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100%"
      flexDirection="column"
    >
      <Box component="div" padding="2em" display="flex" alignItems="center" flexDirection="column">
        <Typography variant="h3" gutterBottom>
          Page not found :(
        </Typography>
        <Typography variant="h6" gutterBottom>
          The page you&apos;re looking for was not found.
        </Typography>
        <Typography variant="h6" gutterBottom>
          <Button href="/">Take me home </Button>
        </Typography>
        <Box
          component="div"
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
        >
          <img
            src="/images/illustrations/undraw_not_found_60pq.svg"
            width="100%"
            alt="Page not found"
          />
        </Box>
      </Box>
    </Box>
  )
}

Page.Layout = BlankLayout

export default Page
