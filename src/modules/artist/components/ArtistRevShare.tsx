import { Button } from '@mui/material'
import React from 'react'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'

const ArtistRevShare = ({ onComplete, onBack }) => {
  return (
    <div className="pt-4">
      <div className="flex flex-col items-center rounded-lg border border-solid border-slate-600 bg-background-dark p-8">
        <h3 className="text-center text-xl">Enjoy 100% revenue share for the first 6 months!</h3>
        <p className="text-md max-w-2xl text-center">
          After your first 6 month, you keep 80% of all the revenue you generate. You will be payed
          out monthly via direct deposit. You can set this up later in your account.
        </p>
      </div>
      <div className="flex w-full justify-between pt-12">
        <Button color="inherit" onClick={onBack}>
          <ChevronLeftIcon />
          Back
        </Button>
        <Button variant="outlined" onClick={onComplete}>
          Agree & Next
        </Button>
      </div>
    </div>
  )
}

export default ArtistRevShare
