import { Box, Link } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import React from 'react'

import { ROOT_URL } from 'src/ApplicationConfiguration'

export default function Footer() {
  return (
    <div>
      <div className="mb-6 flex flex-col items-center">
        <Box fontWeight="fontWeightLight">
          © 2022 <b>Bevios</b>
        </Box>
        <Box
          display="flex"
          textAlign="center"
          justifyContent="center"
          alignItems="center"
          minHeight="45px"
          marginBottom={1}
        >
          Made with{' '}
          <FavoriteIcon className="mx-2 text-red-600 transition-transform hover:scale-150" /> in
          Atlanta
        </Box>
        <Box component="div" display="flex" justifyContent="center">
          <Link
            variant="body2"
            underline="none"
            align="center"
            href={`${ROOT_URL}/terms-of-use`}
            target="_blank"
            style={{ marginRight: '1em' }}
          >
            terms of use
          </Link>
          <Link
            variant="body2"
            underline="none"
            align="center"
            href={`${ROOT_URL}/privacy-policy`}
            target="_blank"
          >
            privacy policy
          </Link>
        </Box>
      </div>
    </div>
  )
}
