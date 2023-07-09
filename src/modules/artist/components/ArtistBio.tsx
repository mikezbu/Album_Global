import { observer } from 'mobx-react'
import React from 'react'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import PublicIcon from '@mui/icons-material/Public'
import TwitterIcon from '@mui/icons-material/Twitter'
import { ArtistModel } from 'src/modules/artist/store'
import { NoSsr, SvgIcon } from '@mui/material'
import dynamic from 'next/dynamic'

const EditorJS = dynamic(() => import('src/modules/editor/Editor'), {
  ssr: false,
})
interface IArtistBio {
  artist: ArtistModel
}

const ArtistBio = observer(
  class ArtistBio extends React.PureComponent<IArtistBio> {
    editor

    constructor(props) {
      super(props)
      this.editor = React.createRef()
    }

    public render() {
      const { artist } = this.props

      return (
        <NoSsr>
          <div className="flex h-full w-full flex-col p-4">
            <EditorJS data={this.getBio(artist.bio)} readOnly editorRef={this.editor} />
            <div className="flex flex-col items-start">
              {artist.website.length > 0 && (
                <div
                  className="flex cursor-pointer items-center pb-4 text-base hover:text-primary-main"
                  onClick={() => window.open(artist.website, '_blank')}
                >
                  <PublicIcon className="mr-2" fontSize="medium" /> Website
                </div>
              )}
              {artist.instagram.length > 0 && (
                <div
                  className="flex cursor-pointer items-center pb-4 text-base hover:text-primary-main"
                  onClick={() => window.open(artist.instagram, '_blank')}
                >
                  <InstagramIcon className="mr-2" fontSize="medium" /> Instagram
                </div>
              )}
              {artist.facebookLink.length > 0 && (
                <div
                  className="flex cursor-pointer items-center pb-4 text-base hover:text-primary-main"
                  onClick={() => window.open(artist.facebookLink, '_blank')}
                >
                  <FacebookIcon className="mr-2" fontSize="medium" /> Facebook
                </div>
              )}
              {artist.twitterLink.length > 0 && (
                <div
                  className="flex cursor-pointer items-center pb-4 text-base hover:text-primary-main"
                  onClick={() => window.open(artist.twitterLink, '_blank')}
                >
                  <TwitterIcon className="mr-2" fontSize="medium" /> Twitter
                </div>
              )}
              {artist.soundCloud.length > 0 && (
                <div
                  className="flex cursor-pointer items-center pb-4 text-base hover:text-primary-main"
                  onClick={() => window.open(artist.soundCloud, '_blank')}
                >
                  <SvgIcon className="mr-2" fontSize="medium">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24px"
                      height="24px"
                    >
                      <path d="M 14.5 6 C 12.601563 6 11 6.90625 10 8.40625 L 10 17 L 20.5 17 C 22.398438 17 24 15.398438 24 13.5 C 24 11.601563 22.398438 10 20.5 10 C 20.300781 10 20.011719 9.992188 19.8125 10.09375 C 19.210938 7.695313 17 6 14.5 6 Z M 8 8 L 8 17 L 9 17 L 9 8.09375 C 8.699219 7.992188 8.300781 8 8 8 Z M 7 8.09375 C 6.601563 8.195313 6.300781 8.398438 6 8.5 L 6 17 L 7 17 Z M 5 9.40625 C 4.5 9.90625 4.195313 10.488281 4.09375 11.1875 L 4 11.1875 L 4 17 L 5 17 Z M 3 11 C 2.601563 11 2.300781 11.085938 2 11.1875 L 2 16.8125 C 2.300781 16.914063 2.601563 17 3 17 Z M 1 11.8125 C 0.398438 12.3125 0 13.101563 0 14 C 0 14.898438 0.398438 15.6875 1 16.1875 Z" />
                    </svg>
                  </SvgIcon>{' '}
                  SoundCloud
                </div>
              )}
            </div>
          </div>
        </NoSsr>
      )
    }

    private getBio = (bio: string) => {
      try {
        return JSON.parse(bio)
      } catch (_error) {
        return {}
      }
    }
  }
)

export default ArtistBio
