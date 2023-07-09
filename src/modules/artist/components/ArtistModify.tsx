import { Button, InputAdornment, SvgIcon, TextField } from '@mui/material'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import PublicIcon from '@mui/icons-material/Public'
import TwitterIcon from '@mui/icons-material/Twitter'
import { inject, observer } from 'mobx-react'
import Router from 'next/router'
import React, { useEffect, useRef } from 'react'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'

import Loading from 'src/common/components/layout/Loading'
import { ArtistStore, getStore } from 'src/common/store'
import { APP_URL } from 'src/ApplicationConfiguration'
import CountryList from 'src/util/CountryList'
import dynamic from 'next/dynamic'
import { useForm } from 'react-hook-form'

const EditorJS = dynamic(() => import('src/modules/editor/Editor'), {
  ssr: false,
})

interface IArtistModify {
  artistStore?: ArtistStore
  createArtist?: boolean
  selectedFiles: Map<string, any>
  onComplete?: () => void
  onBack?: () => void
}

type FormData = {
  name: string
  urlAlias: string
  city: string
  state: string
  region: string
  country: string
  bio: string
  website: string
  facebookLink: string
  twitterLink: string
  soundCloud: string
  instagram: string
}

const ArtistModify = inject('artistStore')(
  observer(({ artistStore, onComplete, selectedFiles, onBack, createArtist }: IArtistModify) => {
    const editorJS = useRef(null)

    const {
      register,
      reset,
      handleSubmit,
      formState: { errors },
    } = useForm<FormData>({
      defaultValues: {
        country: getStore().appState.userCountry,
        state: getStore().appState.region,
      },
    })

    useEffect(() => {
      if (artistStore.artistToCreateOrModify.id) {
        reset({ ...artistStore.artistToCreateOrModify })
      }
    }, [artistStore.artistToCreateOrModify, createArtist, reset])

    const getBio = (bio: string) => {
      try {
        return JSON.parse(bio)
      } catch (_error) {
        return {
          blocks: [
            {
              data: { text: '' },
              id: '1',
              type: 'paragraph',
            },
          ],
        }
      }
    }

    const onSubmit = async (formData: FormData) => {
      const bio = await editorJS.current.save()
      formData.bio = JSON.stringify(bio)

      artistStore.setArtistToCreateOrModify(formData)

      if (!artistStore.artistToCreateOrModify.id) {
        await artistStore.createArtist(Array.from(selectedFiles.values()))
      } else {
        await artistStore.updateArtist(Array.from(selectedFiles.values()))
      }

      if (artistStore.artistUpdated || artistStore.artistCreated) {
        artistStore.resetFlags()
        onComplete?.()
      }
    }

    const getActionLabel = () => {
      if (createArtist) {
        return 'Next'
      }

      return 'Save'
    }

    const artist = artistStore.artistToCreateOrModify

    return (
      <form className="relative flex flex-col gap-4 py-8" onSubmit={handleSubmit(onSubmit)}>
        {artistStore.updating && <Loading position="absolute" />}
        <div>
          {!createArtist && (
            <div className="mt-4 flex items-center justify-between pb-2">
              {artistStore.artistToCreateOrModify.urlAlias &&
                artistStore.artistToCreateOrModify.id > 0 && (
                  <div className="mr-4">
                    <Button
                      color="primary"
                      variant="outlined"
                      className="self-end"
                      onClick={() =>
                        Router.push(
                          '/artists/[slug]',
                          `/artists/${artistStore.artistToCreateOrModify.urlAlias}`
                        )
                      }
                    >
                      VIEW PROFILE
                    </Button>
                  </div>
                )}
              <Button color="primary" variant="contained" type="submit" className="mr-4 self-end">
                {getActionLabel()}
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <TextField
            fullWidth
            variant="filled"
            required
            type="text"
            label="Artist Name"
            autoComplete="off"
            error={Boolean(errors.name?.message)}
            helperText={errors.name?.message}
            {...register('name', { required: true })}
          />

          <TextField
            fullWidth
            variant="filled"
            required
            type="text"
            label="Artist Handle"
            autoComplete="off"
            error={Boolean(errors.urlAlias?.message)}
            helperText={errors.urlAlias?.message || `${APP_URL}/...`}
            {...register('urlAlias', {
              required: true,
              pattern: {
                value: /^[a-zA-Z0-9-]+$/,
                message: 'Artist handle cannot contain special characters including space',
              },
            })}
          />
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="City"
            {...register('city')}
            error={Boolean(errors.city)}
            helperText={errors.city?.message}
            autoComplete="off"
          />

          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="State"
            {...register('state')}
            error={Boolean(errors.state)}
            helperText={errors.state?.message}
          />

          <TextField
            select
            fullWidth
            variant="filled"
            type="text"
            label="Country"
            {...register('country')}
            error={Boolean(errors.country)}
            helperText={errors.country?.message}
            SelectProps={{
              native: true,
            }}
          >
            {CountryList.map(option => (
              <option key={option.name} value={option.name}>
                {option.name}
              </option>
            ))}
          </TextField>
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="h-full w-full rounded border border-solid border-gray-400 bg-white bg-opacity-10 p-3">
            <div className="text-gray-300">Biography</div>
            <div className="px-8">
              <EditorJS data={getBio(artist.bio)} editorRef={editorJS} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-8">
          <div className="text-lg font-bold">Social Media Accounts</div>
          <div className="text pb-2">
            Add links to your social media accounts to increase your discoverablity
          </div>
          <div className="w-full border-[0.25px] border-solid border-gray-600" />

          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Website"
            {...register('website', {
              pattern: {
                value: /^https?:\/\/(www.)?.*/,
                message: 'Website must start with http(s)://...',
              },
            })}
            error={Boolean(errors.website)}
            helperText={errors.website?.message}
            autoComplete="off"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PublicIcon />
                </InputAdornment>
              ),
            }}
          />

          <div className="flex flex-col gap-4 md:flex-row">
            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="Facebook"
              {...register('facebookLink', {
                pattern: {
                  value: /^https?:\/\/(www.)?facebook.com\/.*/,
                  message: 'Facebook link starts with https://facebook.com/...',
                },
              })}
              error={Boolean(errors.facebookLink)}
              helperText={errors.facebookLink?.message}
              autoComplete="off"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FacebookIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="Twitter"
              {...register('twitterLink', {
                pattern: {
                  value: /^https?:\/\/(www.)?twitter.com\/.*/,
                  message: 'Twitter link starts with https://twitter.com/...',
                },
              })}
              error={Boolean(errors.twitterLink)}
              helperText={errors.twitterLink?.message}
              autoComplete="off"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TwitterIcon />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="Instagram"
              {...register('instagram', {
                pattern: {
                  value: /^https?:\/\/(www.)?instagram.com\/.*/,
                  message: 'Instagram link starts with https://instagram.com/...',
                },
              })}
              error={Boolean(errors.instagram)}
              helperText={errors.instagram?.message}
              autoComplete="off"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InstagramIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="SoundCloud"
              {...register('soundCloud', {
                pattern: {
                  value: /^https?:\/\/(www.)?soundcloud.com\/.*/,
                  message: 'SoundCloud link starts with https://soundcloud.com/...',
                },
              })}
              error={Boolean(errors.soundCloud)}
              helperText={errors.soundCloud?.message}
              autoComplete="off"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SvgIcon>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24px"
                        height="24px"
                      >
                        <path d="M 14.5 6 C 12.601563 6 11 6.90625 10 8.40625 L 10 17 L 20.5 17 C 22.398438 17 24 15.398438 24 13.5 C 24 11.601563 22.398438 10 20.5 10 C 20.300781 10 20.011719 9.992188 19.8125 10.09375 C 19.210938 7.695313 17 6 14.5 6 Z M 8 8 L 8 17 L 9 17 L 9 8.09375 C 8.699219 7.992188 8.300781 8 8 8 Z M 7 8.09375 C 6.601563 8.195313 6.300781 8.398438 6 8.5 L 6 17 L 7 17 Z M 5 9.40625 C 4.5 9.90625 4.195313 10.488281 4.09375 11.1875 L 4 11.1875 L 4 17 L 5 17 Z M 3 11 C 2.601563 11 2.300781 11.085938 2 11.1875 L 2 16.8125 C 2.300781 16.914063 2.601563 17 3 17 Z M 1 11.8125 C 0.398438 12.3125 0 13.101563 0 14 C 0 14.898438 0.398438 15.6875 1 16.1875 Z" />
                      </svg>
                    </SvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </div>

        <div className="flex w-full justify-between pt-10">
          {onBack && (
            <Button color="inherit" onClick={onBack}>
              <ChevronLeftIcon />
              Back
            </Button>
          )}
          <Button color="primary" variant="contained" type="submit" className="self-end">
            {getActionLabel()}
          </Button>
        </div>
      </form>
    )
  })
)

export default ArtistModify
