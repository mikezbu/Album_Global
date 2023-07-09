import { Autocomplete, Chip, CircularProgress, TextField } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React from 'react'

import { KeyStore } from 'src/common/store'
import KeyModel from 'src/modules/key/store/model/KeyModel'

interface IKeyAutoComplete {
  keyStore?: KeyStore
  selectedKey: KeyModel
  onKeysSelect(key: KeyModel): void
  className?: string
  disableClearable?: boolean
}

const KeyAutoComplete = inject('keyStore')(
  observer(
    class KeyAutoComplete extends React.Component<IKeyAutoComplete> {
      private readonly _keyStore: KeyStore

      constructor(props: IKeyAutoComplete) {
        super(props)

        this._keyStore = props.keyStore
      }

      public componentDidMount() {
        if (!this._keyStore.loaded) {
          this._keyStore.fetchKeys()
        }
      }

      public render() {
        return (
          <>
            <Autocomplete
              className={this.props.className}
              disableClearable={this.props.disableClearable}
              onChange={(_event: React.SyntheticEvent, key: KeyModel) => {
                this.onChange(key)
              }}
              isOptionEqualToValue={(option: KeyModel, value: KeyModel) => option.id === value.id}
              getOptionLabel={(option: KeyModel) => option.name}
              options={!this._keyStore.loading ? Array.from(this._keyStore.keys.values()) : []}
              loading={this._keyStore.loading}
              noOptionsText="No matching key found"
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
                  label="Keys"
                  fullWidth
                  variant="filled"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {this._keyStore.loading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </>
        )
      }

      private onChange = (key: KeyModel) => {
        this.props.onKeysSelect(key)
      }
    }
  )
)

export default KeyAutoComplete
