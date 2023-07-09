import { Button, Chip, Drawer, IconButton } from '@mui/material'
import PauseIcon from '@mui/icons-material/PauseCircleFilled'
import PlayIcon from '@mui/icons-material/PlayCircleFilled'
import DownloadIcon from '@mui/icons-material/Download'
import { ObservableMap, values } from 'mobx'
import React from 'react'
import {
  DataGrid,
  GridColumns,
  GridPreProcessEditCellProps,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowModel,
  GridRowParams,
  GridSortModel,
  GridValueGetterParams,
  GridValueSetterParams,
} from '@mui/x-data-grid'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'

import { Order } from 'src/common/store/util/Paginator'
import GenreModel from 'src/modules/genre/store/model/GenreModel'
import InstrumentModel from 'src/modules/instrument/store/model/InstrumentModel'
import TrackStore, { TrackModel } from 'src/modules/track/store'
import { ActionType } from 'src/modules/track/components/TrackTable'
import { inject, observer } from 'mobx-react'
import EditTrackModal from './EditTrackModal'
import KeyAutoComplete from 'src/modules/key/components/KeyAutoComplete'
import KeyModel from 'src/modules/key/store/model/KeyModel'
import TagModel from 'src/modules/tag/store/model/TagModel'
import ImagePreview from 'src/common/components/image/ImagePreview'
import { TrackStatus } from '../store/model/TrackModel'

export interface ITrackColumn {
  id: number
  play: number
  artwork: number
  title: string
  'artist.name': string
  'genres.name': string
  'instruments.name': string
  'key.name': string
  duration: string
  playCount: string
  'price.amount': string
  options: string
}

interface IEditableTrackTable {
  trackStore?: TrackStore
  onTrackSelect: (id: number) => void
  onDownloadClick: (id: number) => void
  setTrackToPlay: (id: number) => void
  isAdmin: boolean
  selectedTrackId: number
  data: ObservableMap<number, TrackModel>
  playbackControl: (state: number) => void
  showPagination?: true
  isTrackPlaying: boolean
  rowsPerPage: number
  totalCount: number
  pageNumber: number
  sortDirection: Order
  sortColumn: string
  setRowsPerPage: (pageSize: number) => void
  setPageNumber: (pageNumber: number) => void
  setSort: (sortDirection: Order, sortColumn: string) => void
  disableSorting?: false
  actionType?: ActionType.PlayPause
}

const EditableTrackTable = inject('trackStore')(
  observer((props: IEditableTrackTable) => {
    const [sortModel, setSortModel] = React.useState<GridSortModel>([
      { field: props.sortColumn, sort: props.sortDirection },
    ])

    const [openEditor, setOpenEditor] = React.useState(false)
    const [status, setStatus] = React.useState('0')

    const onTrackSelect = (params: GridRowParams) => {
      props.trackStore.selectTrackById(params.row.id)
      props.trackStore.setTrackToUpdateById(params.row.id)
      setStatus(props.trackStore.trackToUpdate.status.toString())
    }

    const handleChangePage = (page: number) => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      props.setPageNumber(page)
    }

    const handleChangeRowsPerPage = (pageSize: number) => {
      props.setRowsPerPage(pageSize)
    }

    const onRowEditStop = () => {
      props.trackStore.updateTrack([])
    }

    const handleInputChange =
      (name: string) =>
      (params: GridValueSetterParams): GridRowModel => {
        const value = params.value.toString()
        props.trackStore.updateTrackToUpdateProperty(name, value)

        return { ...params.row, value }
      }

    const handlePriceChange = (params: GridValueSetterParams) => {
      const value = params.value.toString()

      props.trackStore.updateTrackToUpdatePrice(parseFloat(value))

      return { ...params.row, value }
    }

    const updateKey = (key: KeyModel) => {
      props.trackStore.updateTrackToUpdateKey(key)
    }

    const handleStatusChange = (event: SelectChangeEvent) => {
      props.trackStore.updateTrackToUpdateStatus(parseInt(event.target.value))
      setStatus(event.target.value)
    }

    const handleSortModelChange = (newModel: GridSortModel) => {
      if (newModel[0]) {
        setSortModel(newModel)
        props.setSort(newModel[0].sort, newModel[0].field)
      }
    }

    const editTrack = (id: number) => {
      onPause()
      props.onTrackSelect(id)
      setOpenEditor(true)
    }

    const onPlay = (id: number) => {
      props.setTrackToPlay(id)
      props.playbackControl(2)
    }

    const onPause = () => {
      props.playbackControl(1)
      props.setTrackToPlay(-1)
    }

    const isSelected = (id: number) => props.selectedTrackId === id

    const columns: GridColumns = [
      {
        field: 'id',
        hide: true,
      },
      {
        field: 'actions',
        type: 'actions',
        width: props.isAdmin ? 190 : 140,
        getActions: params => {
          const isItemSelected = isSelected(Number.parseInt(params.id.toString(), 10))

          return [
            <Button
              key={params.id.toString()}
              aria-label="edit"
              variant="text"
              color="primary"
              size="small"
              onClick={() => editTrack(parseInt(params.id.toString(), 10))}
            >
              EDIT
            </Button>,
            props.isAdmin ? (
              <IconButton
                key="download-button"
                disableRipple
                color="primary"
                onClick={() => props.onDownloadClick(Number.parseInt(params.id.toString()))}
                className="hover:text-primary-dark"
              >
                <DownloadIcon className="text-2xl sm:text-3xl" />
              </IconButton>
            ) : (
              <></>
            ),
            props.isTrackPlaying && isItemSelected ? (
              <IconButton
                key="pause-button"
                disableRipple
                color="primary"
                onClick={onPause}
                className="hover:text-primary-dark"
              >
                <PauseIcon className="text-2xl sm:text-3xl" />
              </IconButton>
            ) : (
              <></>
            ),
            !props.isTrackPlaying || !isItemSelected ? (
              <IconButton
                key="play-button"
                disableRipple
                color="primary"
                onClick={() => onPlay(Number.parseInt(params.id.toString(), 10))}
                className="hover:text-primary-dark"
              >
                <PlayIcon className="text-2xl sm:text-3xl" />
              </IconButton>
            ) : (
              <></>
            ),
          ]
        },
      },
      {
        field: 'artwork',
        headerName: 'Artwork',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams) => (
          <ImagePreview
            id={params.row?.id}
            src={params.row?.artworkUrl}
            className="h-[50px] w-[50px]"
          />
        ),
      },
      {
        headerName: 'Title',
        field: 'title',
        editable: true,
        width: 220,
        valueSetter: handleInputChange('title'),
      },
      {
        field: 'price',
        headerName: 'Price',
        editable: true,
        width: 100,
        renderCell: (params: GridRenderCellParams) => (
          <div className="w-16 rounded-md border-[1px] border-solid border-primary-main py-0.5 text-center text-sm text-primary-main">
            {params.row.price.formattedPrice}
          </div>
        ),
        preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
          const hasError = !parseInt(params.props.value.toString())
          return { ...params.props, error: hasError }
        },
        valueSetter: handlePriceChange,
        valueGetter: (params: GridValueGetterParams) => params.row.price.amountForDisplay,
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 150,
        editable: true,
        renderCell: (params: GridRenderCellParams) => {
          return (
            <Chip
              label={params.row.statusLabel}
              size="small"
              className={`mr-3 text-xs font-bold ${getStatusColor(params.row.status)}`}
            />
          )
        },
        renderEditCell: (props: GridRenderEditCellParams) => {
          return (
            <FormControl fullWidth>
              <Select value={status} onChange={handleStatusChange}>
                <MenuItem value={TrackStatus.Unpublished}>Unpublished</MenuItem>
                <MenuItem value={TrackStatus.Published}>Published</MenuItem>
                <MenuItem value={TrackStatus.Archived}>Archived</MenuItem>
              </Select>
            </FormControl>
          )
        },
      },
      {
        headerName: 'Key',
        field: 'key',
        width: 150,
        editable: true,
        renderCell: (params: GridRenderCellParams) => {
          return params.row.key?.id > 0 ? (
            <Chip label={params.row.key.name} size="small" className="mr-3" />
          ) : (
            <></>
          )
        },
        renderEditCell: () => (
          <KeyAutoComplete
            className="w-full"
            disableClearable
            selectedKey={props.trackStore.trackToUpdate.key}
            onKeysSelect={updateKey}
          />
        ),
      },
      {
        headerName: 'Instruments',
        field: 'instrument',
        width: 150,
        editable: false,
        renderCell: (params: GridRenderCellParams) =>
          params.row.instruments.map((instrument: InstrumentModel) => (
            <Chip key={instrument.id} label={instrument.name} size="small" className="mr-3" />
          )),
      },
      {
        headerName: 'Genres',
        field: 'genre',
        editable: false,
        width: 150,
        renderCell: (params: GridRenderCellParams) =>
          params.row.genres.map((genre: GenreModel) => (
            <Chip key={genre.id} label={genre.name} size="small" className="mr-3" />
          )),
      },
      {
        headerName: 'Tags',
        field: 'tag',
        width: 150,
        editable: false,
        renderCell: (params: GridRenderCellParams) =>
          params.row.tags.map((tag: TagModel) => (
            <Chip key={tag.id} label={tag.name} size="small" className="mr-3" />
          )),
      },
      {
        headerName: 'Produced By',
        field: 'producedBy',
        editable: true,
        width: 150,
        valueSetter: handleInputChange('producedBy'),
      },
      {
        headerName: 'Written By',
        field: 'writtenBy',
        editable: true,
        width: 150,
        valueSetter: handleInputChange('writtenBy'),
      },
      {
        headerName: 'Updated At',
        field: 'updatedDate',
        editable: false,
        width: 150,
        renderCell: (params: GridRenderCellParams) =>
          params.row.updatedDate ? params.row.updatedDate.toLocaleString('en-US') : '',
      },
      {
        headerName: 'Created At',
        field: 'createdDate',
        editable: false,
        width: 150,
        renderCell: (params: GridRenderCellParams) =>
          params.row.createdDate ? params.row.createdDate.toLocaleString('en-US') : '',
      },
    ]
    const data = values(props.data) as TrackModel[]

    const getStatusColor = (status: number) => {
      switch (status) {
        case TrackStatus.Unpublished:
          return 'bg-yellow-600'
        case TrackStatus.Published:
          return 'bg-green-600'
        case TrackStatus.Archived:
          return 'bg-red-600'
        default:
          return 'N/A'
      }
    }

    return (
      <>
        <div className="h-full w-full">
          <DataGrid
            autoHeight
            rowHeight={60}
            columns={columns}
            pagination
            rows={data}
            columnBuffer={12}
            paginationMode="server"
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            sortingMode="server"
            rowsPerPageOptions={[24, 48, 96]}
            pageSize={props.rowsPerPage}
            onPageSizeChange={handleChangeRowsPerPage}
            page={props.pageNumber}
            onPageChange={handleChangePage}
            rowCount={props.totalCount}
            editMode="row"
            onRowEditStart={onTrackSelect}
            onRowEditStop={onRowEditStop}
            classes={{ root: 'border-none' }}
            components={{
              NoRowsOverlay: () => (
                <div className="flex h-full w-full items-center justify-center">
                  No tracks found
                </div>
              ),
            }}
          />
        </div>
        <Drawer
          anchor="right"
          open={openEditor}
          onClose={() => setOpenEditor(false)}
          classes={{
            paper: 'w-full sm:w-1/2',
          }}
        >
          <EditTrackModal onClose={() => setOpenEditor(false)} />
        </Drawer>
      </>
    )
  })
)

export default EditableTrackTable
