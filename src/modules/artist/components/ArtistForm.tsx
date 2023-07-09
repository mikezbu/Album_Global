import { Button, TextField } from '@mui/material'
import dynamic from 'next/dynamic'
import React, { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import Loading from 'src/common/components/layout/Loading'
import { getStore } from 'src/common/store'
import { useCreateArtist, useGetArtist, useUpdateArtist } from '../api'
const EditorJS = dynamic(() => import('src/modules/editor/Editor'), {
  ssr: false,
})

interface ArtistFormProps {
  selectedFiles: Map<string, any>
  onComplete?: () => void
  artistId?: number
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

const ArtistForm = ({ selectedFiles, onComplete, artistId }: ArtistFormProps) => {
  const editorJS = useRef(null)
  const { data, error, isFetching } = useGetArtist(artistId, !!artistId)
  const {
    data: updatedData,
    error: updateError,
    isLoading: isUpdating,
    mutate: update,
  } = useUpdateArtist()

  const {
    data: createdData,
    error: createError,
    isLoading: isCreating,
    mutate: create,
  } = useCreateArtist()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      country: getStore().appState.userCountry,
      state: getStore().appState.region,
    },
  })

  useEffect(() => {
    if (!isCreating && !isUpdating && data) {
      reset({ ...data?.data })
    }
  }, [isCreating, isUpdating, data, reset])

  useEffect(() => {
    if (createdData) {
      getStore().authenticationStore.reAuthenticate(true)
    }

    if (createdData || updatedData) {
      onComplete?.()
    }
  }, [createdData, updatedData, onComplete])

  const onSubmit = async (formData: FormData) => {
    const bio = await editorJS.current.save()
    formData.bio = JSON.stringify(bio)

    if (artistId) {
      update({ id: artistId, body: formData })
    } else {
      create({ body: formData })
    }
  }

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

  return (
    <form className="relative flex flex-col gap-4 py-8" onSubmit={handleSubmit(onSubmit)}>
      {(isFetching || isUpdating || isCreating) && <Loading position="absolute" />}

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
          helperText={errors.urlAlias?.message}
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
          fullWidth
          variant="filled"
          type="text"
          label="Country"
          {...register('country')}
          error={Boolean(errors.country)}
          helperText={errors.country?.message}
        />
      </div>
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="h-full w-full rounded border border-solid border-gray-400 bg-white bg-opacity-10 p-3">
          <div className="text-gray-300">Biography</div>
          <div className="px-8">
            <EditorJS data={getBio(data?.data?.bio)} editorRef={editorJS} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-lg font-bold">Social Media Accounts</div>
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
          />
        </div>
      </div>

      <div className="self-end pt-10">
        <Button type="submit" variant="outlined">
          {artistId ? 'Save' : 'Create'}
        </Button>
      </div>
    </form>
  )
}

export default ArtistForm
