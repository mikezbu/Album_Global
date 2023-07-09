import { Button } from '@mui/material'
import React from 'react'
import Confetti from 'react-confetti'
import { getStore } from 'src/common/store'

const ArtistSignUpConfirmation = ({ onComplete }) => {
  return (
    <div className="flex flex-col">
      <div className="absolute inset-0 h-screen w-screen">
        <Confetti className="relative" recycle={false} numberOfPieces={500} tweenDuration={15000} />
      </div>

      <div className="flex flex-col items-center rounded-lg border border-solid border-slate-600 bg-background-dark p-8">
        <h3 className="text-center text-xl">
          Congratulations, {getStore().userStore.user.firstName}! Your profile has been created.
        </h3>
        <p className="text-md text-center">
          You can now go to your artist profile and start uploading tracks and set your prices!
        </p>
      </div>

      <div className="flex w-full justify-end pt-12">
        <Button variant="contained" onClick={onComplete}>
          Go To My Profile
        </Button>
      </div>
    </div>
  )
}

export default ArtistSignUpConfirmation
