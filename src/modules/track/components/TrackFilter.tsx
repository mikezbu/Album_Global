import { Button, Checkbox, Divider, FormControlLabel, FormGroup } from '@mui/material'
import clsx from 'clsx'
import { values } from 'mobx'
import { inject, observer } from 'mobx-react'
import React from 'react'
import Loading from 'src/common/components/layout/Loading'

import { GenreStore, InstrumentStore, KeyStore, TagStore } from 'src/common/store'
import { Operation } from 'src/common/store/util/SearchCriteria'

interface ITrackFilter {
  genreStore?: GenreStore
  tagStore?: TagStore
  instrumentStore?: InstrumentStore
  keyStore?: KeyStore
  className?: string
  forceResetFilter?: boolean
  onApplyFilter: (filterCriteria) => void
  onResetFilter: () => void
}

const TrackFilter = inject(
  'genreStore',
  'tagStore',
  'instrumentStore',
  'keyStore'
)(
  observer(
    class TrackFilter extends React.Component<ITrackFilter> {
      public state = {
        selectedGenreIds: [],
        selectedInstrumentIds: [],
        selectedTagIds: [],
        selectedKeyIds: [],
      }

      private readonly _genreStore: GenreStore
      private readonly _tagStore: TagStore
      private readonly _instrumentStore: InstrumentStore
      private readonly _keyStore: KeyStore

      constructor(props: ITrackFilter) {
        super(props)

        this._genreStore = props.genreStore
        this._tagStore = props.tagStore
        this._instrumentStore = props.instrumentStore
        this._keyStore = props.keyStore

        if (!this._genreStore.loaded) {
          this._genreStore.fetchGenres()
        }

        if (!this._instrumentStore.loaded) {
          this._instrumentStore.fetchInstruments()
        }

        if (!this._tagStore.loaded) {
          this._tagStore.fetchTags()
        }

        if (!this._keyStore.loaded) {
          this._keyStore.fetchKeys()
        }
      }

      componentDidUpdate(): void {
        if (this.props.forceResetFilter) {
          this.onReset()
        }
      }

      public render() {
        return (
          <div
            className={clsx(
              'relative hidden w-full max-w-[230px] flex-col rounded-lg bg-background-dark p-4 md:flex',
              this.props.className
            )}
          >
            {this._genreStore.loading ||
              this._tagStore.loading ||
              (this._instrumentStore.loading ? (
                <Loading size={40} position="absolute" />
              ) : (
                <>
                  <div className="text-center text-sm uppercase">Filter</div>
                  <Divider className="mt-4 mb-2" />
                  <div className="my-2 text-base font-semibold">Genre</div>
                  <div className="flex max-h-72 flex-col overflow-auto p-2">
                    {values(this._genreStore.genres).map(genre => (
                      <FormGroup key={genre.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              value={genre.id}
                              checked={
                                this.state.selectedGenreIds.find(id => id === genre.id) !==
                                undefined
                              }
                              size="small"
                              className="m-0 p-1.5"
                              onChange={(e, checked) => {
                                if (checked) {
                                  const ids = this.state.selectedGenreIds
                                  ids.push(parseInt(e.target.value, 10))
                                  this.setState({ selectedGenreIds: ids })
                                } else {
                                  this.setState({
                                    selectedGenreIds: this.state.selectedGenreIds.filter(
                                      id => id !== parseInt(e.target.value, 10)
                                    ),
                                  })
                                }
                              }}
                            />
                          }
                          label={genre.name}
                        />
                      </FormGroup>
                    ))}
                  </div>
                  <Divider className="mt-4 mb-2" />
                  <div className="my-2 text-base font-semibold">Instruments</div>
                  <div className="flex max-h-72 flex-col overflow-auto p-2">
                    {values(this._instrumentStore.instruments).map(instrument => (
                      <FormGroup key={instrument.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              value={instrument.id}
                              checked={
                                this.state.selectedInstrumentIds.find(
                                  id => id === instrument.id
                                ) !== undefined
                              }
                              size="small"
                              className="m-0 p-1.5"
                              onChange={(e, checked) => {
                                if (checked) {
                                  const ids = this.state.selectedInstrumentIds
                                  ids.push(parseInt(e.target.value, 10))
                                  this.setState({ selectedInstrumentIds: ids })
                                } else {
                                  this.setState({
                                    selectedInstrumentIds: this.state.selectedInstrumentIds.filter(
                                      id => id !== parseInt(e.target.value, 10)
                                    ),
                                  })
                                }
                              }}
                            />
                          }
                          label={instrument.name}
                        />
                      </FormGroup>
                    ))}
                  </div>
                  <Divider className="mt-4 mb-2" />
                  <div className="my-2 text-base font-semibold">Key</div>
                  <div className="flex max-h-72 flex-col overflow-auto p-2">
                    {values(this._keyStore.keys).map(key => (
                      <FormGroup key={key.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              value={key.id}
                              checked={
                                this.state.selectedKeyIds.find(id => id === key.id) !== undefined
                              }
                              size="small"
                              className="m-0 p-1.5"
                              onChange={(e, checked) => {
                                if (checked) {
                                  const ids = this.state.selectedKeyIds
                                  ids.push(parseInt(e.target.value, 10))
                                  this.setState({ selectedKeyIds: ids })
                                } else {
                                  this.setState({
                                    selectedKeyIds: this.state.selectedKeyIds.filter(
                                      id => id !== parseInt(e.target.value, 10)
                                    ),
                                  })
                                }
                              }}
                            />
                          }
                          label={key.name}
                        />
                      </FormGroup>
                    ))}
                  </div>
                  <Divider className="mt-4 mb-2" />
                  <div className="my-2 text-base font-semibold">Tags</div>
                  <div className="flex max-h-72 flex-col overflow-auto p-2">
                    {values(this._tagStore.tags).map(tag => (
                      <FormGroup key={tag.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              value={tag.id}
                              checked={
                                this.state.selectedTagIds.find(id => id === tag.id) !== undefined
                              }
                              size="small"
                              className="m-0 p-1.5"
                              onChange={(e, checked) => {
                                if (checked) {
                                  const ids = this.state.selectedTagIds
                                  ids.push(parseInt(e.target.value, 10))
                                  this.setState({ selectedTagIds: ids })
                                } else {
                                  this.setState({
                                    selectedTagIds: this.state.selectedTagIds.filter(
                                      id => id !== parseInt(e.target.value, 10)
                                    ),
                                  })
                                }
                              }}
                            />
                          }
                          label={tag.name}
                        />
                      </FormGroup>
                    ))}
                  </div>
                  <Divider className="mt-8" />
                  <Button
                    aria-label="upload"
                    variant="contained"
                    color="primary"
                    onClick={this.onApply}
                    className="mt-6"
                    size="small"
                  >
                    Apply Filter
                  </Button>
                  <Button
                    aria-label="upload"
                    variant="text"
                    color="primary"
                    onClick={this.onReset}
                    className="mt-6"
                    size="small"
                  >
                    Reset
                  </Button>
                </>
              ))}
          </div>
        )
      }

      private onApply = () => {
        const joins = []

        if (this.state.selectedGenreIds.length > 0) {
          joins.push({
            key: 'genreIds',
            operation: Operation.In,
            value: this.state.selectedGenreIds,
          })
        }

        if (this.state.selectedInstrumentIds.length > 0) {
          joins.push({
            key: 'instrumentIds',
            operation: Operation.In,
            value: this.state.selectedInstrumentIds,
          })
        }

        if (this.state.selectedTagIds.length > 0) {
          joins.push({
            key: 'tagIds',
            operation: Operation.In,
            value: this.state.selectedTagIds,
          })
        }

        const columns = []
        if (this.state.selectedKeyIds.length > 0) {
          columns.push({
            key: 'keyId',
            operation: Operation.In,
            value: this.state.selectedKeyIds,
          })
        }

        this.props.onApplyFilter({ joins: joins, columns: columns })
      }

      private onReset = () => {
        this.setState({
          selectedGenreIds: [],
          selectedInstrumentIds: [],
          selectedTagIds: [],
          selectedKeyIds: [],
        })

        this.props.onResetFilter()
      }
    }
  )
)

export default TrackFilter
