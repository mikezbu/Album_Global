import {
  Autocomplete,
  Chip,
  CircularProgress,
  createFilterOptions,
  FilterOptionsState,
  TextField,
} from '@mui/material'
import { inject, observer } from 'mobx-react'
import React from 'react'

import { TagStore } from 'src/common/store'
import TagModel from 'src/modules/tag/store/model/TagModel'
import randomNumber from 'src/util/NumberGenerator'

interface ITagAutoComplete {
  tagStore?: TagStore
  selectedTags: TagModel[]
  onTagsSelect(tags: TagModel[]): void
}

const filter = createFilterOptions<TagModel>()

const TagAutoComplete = inject('tagStore')(
  observer(
    class TagAutoComplete extends React.Component<ITagAutoComplete> {
      private readonly _tagStore: TagStore

      public state = {
        inputValue: '',
      }

      constructor(props: ITagAutoComplete) {
        super(props)

        this._tagStore = props.tagStore
        this.state = {
          inputValue: '',
        }
      }

      public componentDidMount() {
        if (!this._tagStore.loaded && !this._tagStore.loading) {
          this._tagStore.fetchTags()
        }
      }

      public render() {
        return (
          <Autocomplete
            multiple
            filterSelectedOptions
            inputValue={this.state.inputValue}
            onInputChange={(event, newInputValue) => {
              this.setState({ inputValue: newInputValue.replace(/\s/g, '') })
            }}
            value={this.props.selectedTags}
            onChange={(_event: React.SyntheticEvent, tags: TagModel[]) => {
              this.onChange(tags)
            }}
            isOptionEqualToValue={(option: TagModel, value: TagModel) => option.id === value.id}
            getOptionLabel={(option: TagModel) =>
              option.newToCreate ? `Add "${option.name}"` : option.name
            }
            options={!this._tagStore.loading ? Array.from(this._tagStore.tags.values()) : []}
            loading={this._tagStore.loading}
            noOptionsText="No matching tag found"
            filterOptions={(options: TagModel[], params: FilterOptionsState<TagModel>) => {
              const filtered = filter(options, params)

              const { inputValue } = params
              // Suggest the creation of a new value
              const isExisting = options.some(option => inputValue === option.name)

              if (inputValue !== '' && inputValue.length > 2 && !isExisting) {
                const tag = new TagModel()
                tag.setId(randomNumber(0, 9999))
                tag.setName(inputValue)
                tag.setNewToCreate(true)

                filtered.push(tag)
              }

              return filtered
            }}
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
                label="Tags"
                fullWidth
                variant="filled"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {this._tagStore.loading ? (
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

      private onChange = (tags: TagModel[]) => {
        this.props.onTagsSelect(tags)
      }
    }
  )
)

export default TagAutoComplete
