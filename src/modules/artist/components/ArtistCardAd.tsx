import Router from 'next/router'
import React from 'react'

interface IArtistCardAd {}

export const ArtistCardAd: React.FunctionComponent<IArtistCardAd> = (props: IArtistCardAd) => {
  const handleClick = () => {
    Router.push('/artists/apply')
  }

  return (
    <div
      className="flex min-h-[252.5px] w-full min-w-[75px] max-w-[200px] cursor-pointer items-center justify-center bg-gradient-to-r from-[#8f6B29] via-[#FDE08D] to-[#DF9F28] p-0.5 shadow-lg duration-200 hover:scale-105 hover:from-[#DF9F28] hover:via-[#8f6B29] hover:to-[#FDE08D]"
      onClick={handleClick}
    >
      <div className="flex h-full w-full flex-col items-center justify-center bg-background-dark p-2">
        <div className="text-lg font-medium">Are you an artists?</div>
        <div className="text-sm font-normal text-gray-300 ">Sell your work here!</div>
      </div>
    </div>
  )
}

export default ArtistCardAd
