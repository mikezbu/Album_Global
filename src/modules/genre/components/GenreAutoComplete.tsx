import { Autocomplete, Chip, CircularProgress, TextField } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React from 'react'

import { GenreStore } from 'src/common/store'
import GenreModel from 'src/modules/genre/store/model/GenreModel'

interface IGenreAutoComplete {
  genreStore?: GenreStore
  selectedGenres: GenreModel[]
  onGenresSelect(genres: GenreModel[]): void
}

const GenreAutoComplete = inject('genreStore')(
  observer(
    class GenreAutoComplete extends React.Component<IGenreAutoComplete> {
      private readonly _genreStore: GenreStore

      constructor(props: IGenreAutoComplete) {
        super(props)

        this._genreStore = props.genreStore
      }

      public componentDidMount() {
        if (!this._genreStore.loaded && !this._genreStore.loading) {
          this._genreStore.fetchGenres()
        }
      }

      public render() {
        return (
          <Autocomplete
            multiple
            filterSelectedOptions
            value={this.props.selectedGenres}
            onChange={(_event: React.SyntheticEvent, genres: GenreModel[]) => {
              this.onChange(genres)
            }}
            isOptionEqualToValue={(option: GenreModel, value: GenreModel) => option.id === value.id}
            getOptionLabel={(option: GenreModel) => option.name}
            options={!this._genreStore.loading ? Array.from(this._genreStore.genres.values()) : []}
            loading={this._genreStore.loading}
            noOptionsText="No matching genre found"
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  key={option.id}
                  label={option.name}
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={params => (
              <TextField
                {...params}
                label="Genres"
                fullWidth
                variant="filled"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {this._genreStore.loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
        )
      }

      private onChange = (genres: GenreModel[]) => {
        this.props.onGenresSelect(genres)
      }
    }
  )
)

export default GenreAutoComplete
