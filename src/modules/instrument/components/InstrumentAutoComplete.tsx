import { Autocomplete, Chip, CircularProgress, TextField } from '@mui/material'
import { inject, observer } from 'mobx-react'
import React from 'react'

import { InstrumentStore } from 'src/common/store'
import InstrumentModel from 'src/modules/instrument/store/model/InstrumentModel'

interface IInstrumentAutoComplete {
  instrumentStore?: InstrumentStore
  selectedInstruments: InstrumentModel[]
  onInstrumentsSelect(instruments: InstrumentModel[]): void
}

const InstrumentAutoComplete = inject('instrumentStore')(
  observer(
    class InstrumentAutoComplete extends React.Component<IInstrumentAutoComplete> {
      private readonly _instrumentStore: InstrumentStore

      constructor(props: IInstrumentAutoComplete) {
        super(props)

        this._instrumentStore = props.instrumentStore
      }

      public componentDidMount() {
        if (!this._instrumentStore.loaded && !this._instrumentStore.loading) {
          this._instrumentStore.fetchInstruments()
        }
      }

      public render() {
        return (
          <Autocomplete
            multiple
            filterSelectedOptions
            value={this.props.selectedInstruments}
            onChange={(_event: React.SyntheticEvent, instruments: InstrumentModel[]) => {
              this.onChange(instruments)
            }}
            isOptionEqualToValue={(option: InstrumentModel, value: InstrumentModel) =>
              option.id === value.id
            }
            getOptionLabel={(option: InstrumentModel) => option.name}
            options={
              !this._instrumentStore.loading
                ? Array.from(this._instrumentStore.instruments.values())
                : []
            }
            loading={this._instrumentStore.loading}
            noOptionsText="No matching instrument found"
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
                label="Instruments"
                fullWidth
                variant="filled"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {this._instrumentStore.loading ? (
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

      private onChange = (instruments: InstrumentModel[]) => {
        this.props.onInstrumentsSelect(instruments)
      }
    }
  )
)

export default InstrumentAutoComplete
