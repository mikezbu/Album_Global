import { Autocomplete, Button, Chip, Divider, Grid, TextField } from '@mui/material'
import { styled } from '@mui/material/styles'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { inject, observer } from 'mobx-react'
import React, { ChangeEvent } from 'react'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'

import Loading from 'src/common/components/layout/Loading'
import Modal from 'src/common/components/modal/Modal'
import { SampleStore } from 'src/common/store'
import confirm from 'src/util/ConfirmationDialog'

const PREFIX = 'EditSampleModal'

const classes = {
  container: `${PREFIX}-container`,
  navigationContainer: `${PREFIX}-navigationContainer`,
  button: `${PREFIX}-button`,
  gridItem: `${PREFIX}-gridItem`,
  grid: `${PREFIX}-grid`,
  actionButtonsContainer: `${PREFIX}-actionButtonsContainer`,
  actionButton: `${PREFIX}-actionButton`,
}

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.container}`]: {
    padding: '1em',
    minWidth: '100%',
  },

  [`& .${classes.navigationContainer}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },

  [`& .${classes.button}`]: {
    margin: theme.spacing(1),
  },

  [`& .${classes.gridItem}`]: {
    padding: theme.spacing(2),
    paddingBottom: 0,
    width: '100%',
  },

  [`& .${classes.grid}`]: {
    marginBottom: '2em',
  },

  [`& .${classes.actionButtonsContainer}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },

  [`& .${classes.actionButton}`]: {
    marginRight: '1em',
  },
}))

interface IEditSampleModal {
  sampleStore?: SampleStore
  open: boolean
  onClose: () => void
}

const EditSampleModal = inject('sampleStore')(
  observer(
    class EditSampleModal extends React.Component<IEditSampleModal> {
      private readonly _sampleStore: SampleStore

      constructor(props: IEditSampleModal) {
        super(props)

        this._sampleStore = props.sampleStore
      }

      public render() {
        const { open } = this.props
        const sample = this._sampleStore.sampleToUpdate

        return (
          <Modal
            title="Edit Sample"
            onClose={this.onCloseModal}
            open={open}
            fullWidth
            maxWidth="lg"
            content={
              <Root>
                <div className={classes.navigationContainer}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    disabled={this._sampleStore.firstSampleToEdit}
                    onClick={this._sampleStore.selectPreviousSampleToUpdate}
                    className={classes.button}
                    startIcon={<ChevronLeftIcon />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    disabled={this._sampleStore.lastSampleToEdit}
                    onClick={this._sampleStore.selectNextSampleToUpdate}
                    className={classes.button}
                    endIcon={<ChevronRightIcon />}
                  >
                    Next
                  </Button>
                </div>
                <Divider />
                <div className={classes.container}>
                  {this._sampleStore.updating && <Loading size={40} />}
                  <ValidatorForm debounceTime={750} onSubmit={this.onSubmit}>
                    <Grid container spacing={3} className={classes.grid}>
                      <Grid container>
                        <Grid item sm={12} md={6} className={classes.gridItem}>
                          <TextValidator
                            name="title"
                            fullWidth
                            required
                            validators={['required']}
                            errorMessages={['Title is required']}
                            type="text"
                            label="Title"
                            onChange={this.handleInputChange('title')}
                            value={sample.title}
                            variant="filled"
                          />
                        </Grid>
                        <Grid item sm={12} md={6} className={classes.gridItem}>
                          <Autocomplete
                            multiple
                            options={[sample.tags]}
                            defaultValue={sample.tags}
                            freeSolo
                            onChange={this.setSelectedTag}
                            renderTags={() =>
                              sample.tags.map((tag, idx) => (
                                <Chip
                                  size="small"
                                  key={idx}
                                  label={tag}
                                  style={{ margin: '0.5em' }}
                                />
                              ))
                            }
                            renderInput={params => (
                              <TextField
                                {...params}
                                fullWidth
                                placeholder="add a tag"
                                type="text"
                                helperText="Press the enter key after each tag"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </ValidatorForm>
                </div>
              </Root>
            }
            actions={
              <div className={classes.actionButtonsContainer}>
                <Button aria-label="Delete Collection" onClick={this.confirmDelete(sample.id)}>
                  Delete
                </Button>
                <div>
                  <Button
                    aria-label="Close"
                    className={classes.actionButton}
                    onClick={this.onCloseModal}
                  >
                    Close
                  </Button>
                  <Button
                    aria-label="Save"
                    variant="contained"
                    color="primary"
                    type="submit"
                    onClick={this.onSubmit}
                  >
                    Save
                  </Button>
                </div>
              </div>
            }
          />
        )
      }

      private setSelectedTag = (_event: React.ChangeEvent<{}>, tags: string[]) => {
        this.updateTags(tags)
      }

      private confirmDelete = (id: number) => () => {
        confirm({
          title: 'Delete Sample?',
          message: 'Are you want to permanently delete this sample?',
          onAnswer: answer => this.handleDelete(answer, id),
          confirmActionText: 'Delete',
        })
      }

      private updateTags = (tags: string[]) => {
        this._sampleStore.updateTags(tags)
      }

      private handleDelete = (answer: boolean, id: number) => {
        if (answer) {
          this._sampleStore.deleteSample(id)
          this.onCloseModal()
        }
      }

      private onSubmit = () => {
        this._sampleStore.updateSample()
      }

      private handleInputChange = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
        this._sampleStore.updateSampleToUpdateProperty(name, e.currentTarget.value)
      }

      private onCloseModal = () => {
        this._sampleStore.resetFlags()
        this.props.onClose()

        setTimeout(() => {}, 200)
      }
    }
  )
)

export default EditSampleModal
