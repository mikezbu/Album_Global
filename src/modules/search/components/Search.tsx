import { Avatar, Input, MenuItem, Paper, Popper, Typography } from '@mui/material'
import { MenuItemProps } from '@mui/material/MenuItem'
import Downshift, { ControllerStateAndHelpers } from 'downshift'
import Router from 'next/router'
import React, { useState } from 'react'
import TagIcon from '@mui/icons-material/Tag'

import { ArtistModel } from 'src/modules/artist/store'
import CollectionModel, { CollectionType } from 'src/modules/collection/store/model/CollectionModel'
import { SampleModel } from 'src/modules/sample/store'
import { search } from 'src/modules/search/api'
import TagModel from 'src/modules/tag/store/model/TagModel'
import { TrackModel } from 'src/modules/track/store'
import { isSuccessResponse } from 'src/util/request/RequestUtils'
import GenreModel from 'src/modules/genre/store/model/GenreModel'
import InstrumentModel from 'src/modules/instrument/store/model/InstrumentModel'
import ImagePreview from 'src/common/components/image/ImagePreview'

export enum SearchType {
  Artist = 1,
  SamplePack = 2,
  Collection = 3,
  Sample = 4,
  Track = 5,
  Tag = 6,
  Genre = 7,
  Instrument = 8,
}

interface ISuggestion {
  id: number
  label: string
  value: string
  imgUrl: string
  type: SearchType
}
interface IRenderSuggestionProps {
  highlightedIndex: number | null
  index: number
  itemProps: MenuItemProps<'div', { button?: never }>
  suggestion: ISuggestion
}

function getTypeLabel(type: SearchType): string {
  switch (type) {
    case SearchType.Artist:
      return 'Artist'
    case SearchType.SamplePack:
      return 'Sample Pack'
    case SearchType.Collection:
      return 'Collection'
    case SearchType.Sample:
      return 'Sample'
    case SearchType.Track:
      return 'Track'
    case SearchType.Tag:
      return ''
    case SearchType.Genre:
      return 'Genre'
    case SearchType.Instrument:
      return 'Instrument'
    default:
      return ''
  }
}

function renderSuggestion(suggestionProps: IRenderSuggestionProps) {
  const { suggestion, index, itemProps, highlightedIndex } = suggestionProps
  const isHighlighted = highlightedIndex === index

  return (
    <MenuItem {...itemProps} selected={isHighlighted} component="div" className="flex p-2">
      {suggestion.type === SearchType.Tag ? (
        <TagIcon className="mr-2" />
      ) : (
        <ImagePreview
          id={suggestion.id}
          src={suggestion.imgUrl}
          alt={suggestion.label}
          className="mr-2 h-[50px] w-[50px]"
        />
      )}
      <div>
        <Typography variant="subtitle1" className="whitespace-normal">
          {suggestion.label}
        </Typography>
        <Typography variant="caption" gutterBottom>
          {getTypeLabel(suggestion.type)}
        </Typography>
      </div>
    </MenuItem>
  )
}

let popperNode: HTMLDivElement | null | undefined

interface ISearch {
  className?: string
  autoFocus?: boolean
}

const Search = (props: ISearch) => {
  const [suggestions, setSuggestions] = useState<ISuggestion[]>([])
  const [noResultsFound, setNoResultsFound] = useState(false)

  const fetchSuggestionCallback = response => {
    if (isSuccessResponse(response)) {
      if (response.data) {
        const newSuggestions: ISuggestion[] = []
        response.data.artists.forEach((artist: ArtistModel) => {
          newSuggestions.push({
            id: artist.id,
            label: artist.name,
            value: artist.urlAlias,
            imgUrl: artist.profileImageUrl,
            type: SearchType.Artist,
          })
        })

        response.data.tracks.forEach((track: TrackModel) => {
          newSuggestions.push({
            id: track.id,
            label: track.title,
            value: track.id.toString(),
            imgUrl: track.artworkUrl,
            type: SearchType.Track,
          })
        })

        response.data.samples.forEach((sample: SampleModel) => {
          newSuggestions.push({
            id: sample.id,
            label: sample.title,
            value: sample.id.toString(),
            imgUrl: '',
            type: SearchType.Sample,
          })
        })

        response.data.collections.forEach((collection: CollectionModel) => {
          newSuggestions.push({
            id: collection.id,
            label: collection.name,
            value: collection.id.toString(),
            imgUrl: collection.albumArtUrl,
            type:
              collection.type === CollectionType.Sample
                ? SearchType.SamplePack
                : SearchType.Collection,
          })
        })

        response.data.tags.forEach((tag: TagModel) => {
          newSuggestions.push({
            id: tag.id,
            label: tag.name,
            value: tag.name,
            imgUrl: '',
            type: SearchType.Tag,
          })
        })

        response.data.genres.forEach((genre: GenreModel) => {
          newSuggestions.push({
            id: genre.id,
            label: genre.name,
            value: genre.name,
            imgUrl: genre.artworkUrl,
            type: SearchType.Genre,
          })
        })

        response.data.instruments.forEach((instrument: InstrumentModel) => {
          newSuggestions.push({
            id: instrument.id,
            label: instrument.name,
            value: instrument.name,
            imgUrl: instrument.artworkUrl,
            type: SearchType.Instrument,
          })
        })

        setSuggestions(newSuggestions)

        if (newSuggestions.length === 0) {
          setNoResultsFound(true)
        } else {
          setNoResultsFound(false)
        }
      } else {
        setSuggestions([])
        setNoResultsFound(true)
      }
    }
  }

  const onInputValueChange = (inputValue: string) => {
    if (inputValue.length > 2) {
      setNoResultsFound(false)
      search({ query: inputValue, size: 4 }, fetchSuggestionCallback)
    } else {
      setSuggestions([])
      setNoResultsFound(false)
    }
  }

  const onSelect = (
    selectedItem: ISuggestion,
    stateAndHelpers: ControllerStateAndHelpers<ISuggestion>
  ) => {
    if (selectedItem) {
      switch (selectedItem.type) {
        case SearchType.Artist:
          Router.push('/artists/[slug]', `/artists/${selectedItem.value}`)
          break
        case SearchType.SamplePack:
          Router.push('/sample-pack/[collectionId]', `/sample-pack/${selectedItem.value}`)
          break
        case SearchType.Collection:
          Router.push('/collection/[collecitonId]', `/collection/${selectedItem.value}`)
          break
        case SearchType.Sample:
          Router.push('/samples/[sampleId]', `/samples/${selectedItem.value}`)
          break
        case SearchType.Track:
          Router.push('/tracks/[trackId]', `/tracks/${selectedItem.value}`)
          break
        case SearchType.Tag:
          Router.push('/tag/[tagName]', `/tag/${selectedItem.value}`)
          break
        case SearchType.Genre:
          Router.push('/genre/[genreName]', `/genre/${selectedItem.value}`)
          break
        case SearchType.Instrument:
          Router.push('/instrument/[instrumentName]', `/instrument/${selectedItem.value}`)
          break
      }

      stateAndHelpers.clearSelection()
    }
  }

  return (
    <Downshift
      id="search-container"
      onInputValueChange={onInputValueChange}
      onSelect={onSelect}
      itemToString={(item: any) => (item ? item.label : '')}
    >
      {({ getInputProps, getItemProps, getMenuProps, highlightedIndex, isOpen }) => {
        return (
          <div className={['h-full w-full rounded-lg', props.className].join(' ')}>
            <Input
              inputRef={node => {
                popperNode = node
              }}
              classes={{
                root: 'w-full h-full flex justify-center items-center pl-4',
                input: 'p-0 w-full h-full text-md',
              }}
              {...getInputProps()}
              autoFocus={props.autoFocus}
              placeholder="Search"
              disableUnderline
            />
            <Popper open={isOpen} anchorEl={popperNode} style={{ zIndex: 1201 }}>
              <div
                {...(isOpen ? getMenuProps({}, { suppressRefError: true }) : {})}
                className="w-full"
              >
                <Paper style={{ width: popperNode ? popperNode.clientWidth : undefined }}>
                  {suggestions.map((suggestion, index) =>
                    renderSuggestion({
                      suggestion,
                      index,
                      itemProps: {
                        ...getItemProps({ item: suggestion, key: suggestion.value }),
                      },
                      highlightedIndex,
                    })
                  )}
                  {noResultsFound && (
                    <MenuItem selected={true} component="div" className="flex p-2">
                      <Avatar variant="square" className="mr-2 flex" />

                      <div>
                        <Typography variant="subtitle1">No results found</Typography>
                      </div>
                    </MenuItem>
                  )}
                </Paper>
              </div>
            </Popper>
          </div>
        )
      }}
    </Downshift>
  )
}

Search.defaultProps = {
  autoFocus: false,
}

export default Search
