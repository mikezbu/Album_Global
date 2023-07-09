import {
  Button,
  Checkbox,
  Drawer,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Paper,
} from '@mui/material'
import { ObservableMap, values } from 'mobx'
import React from 'react'
import {
  DataGrid,
  GridColumns,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowModel,
  GridRowParams,
  GridSortModel,
  GridValueSetterParams,
} from '@mui/x-data-grid'

import { Order } from 'src/common/store/util/Paginator'
import { ActionType } from 'src/modules/track/components/TrackTable'
import { inject, observer } from 'mobx-react'
import { AuthenticationStore, UserStore } from 'src/common/store'
import { UserModel } from 'src/common/store/user'
import { timezones } from 'src/util/DateUtil'

interface IEditableUser {
  userStore?: UserStore
  authenticationStore?: AuthenticationStore
  data: ObservableMap<number, UserModel>
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

const EditableUser = inject(
  'userStore',
  'authenticationStore'
)(
  observer((props: IEditableUser) => {
    const [sortModel, setSortModel] = React.useState<GridSortModel>([
      { field: props.sortColumn, sort: props.sortDirection },
    ])

    const [openEditor, setOpenEditor] = React.useState(false)
    const [timezone, setTimezone] = React.useState('')

    const onSelect = (params: GridRowParams) => {
      props.userStore.selectUserToUpdateById(params.row.id)
      setTimezone(props.userStore.userUpdate.timezone || '')
    }

    const handleChangePage = (page: number) => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      props.setPageNumber(page)
    }

    const handleChangeRowsPerPage = (pageSize: number) => {
      props.setRowsPerPage(pageSize)
    }

    const onRowEditStop = () => {
      props.userStore.adminUpdateUser()
    }

    const handleInputChange =
      (name: string) =>
      (params: GridValueSetterParams): GridRowModel => {
        const value = params.value.toString()
        props.userStore.setValue(name, value)

        return { ...params.row, value }
      }

    const handleSortModelChange = (newModel: GridSortModel) => {
      if (newModel[0]) {
        setSortModel(newModel)
        props.setSort(newModel[0].sort, newModel[0].field)
      }
    }

    const handleTimezoneChange = (event: SelectChangeEvent) => {
      props.userStore.setValue('timezone', event.target.value)
      setTimezone(event.target.value)
    }

    const editTrack = (id: number) => {
      props.userStore.selectUserToUpdateById(id)
    }

    const columns: GridColumns = [
      {
        field: 'actions',
        type: 'actions',
        width: 75,
        getActions: params => {
          return [
            <Tooltip
              title={
                props.authenticationStore.inImpersonation
                  ? "You're already in impersonation mode."
                  : ''
              }
              key={params.id.toString()}
            >
              <span>
                <Button
                  aria-label="log in as"
                  variant="text"
                  color="primary"
                  disabled={props.authenticationStore.inImpersonation}
                  onClick={() =>
                    props.authenticationStore.impersonateUser(parseInt(params.id.toString(), 10))
                  }
                >
                  LOGIN AS
                </Button>
              </span>
            </Tooltip>,
          ]
        },
      },
      {
        headerName: 'ID',
        field: 'id',
        editable: false,
        width: 75,
      },
      {
        field: 'profilePicture',
        headerName: 'Avatar',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams) => {
          return params.row.profilePictureUrl && params.row.profilePictureUrl.length > 0 ? (
            <img
              className="h-[50px] w-[50px]"
              width="100%"
              height="auto"
              src={params.row.profilePictureUrl}
              alt="Profile Picture"
            />
          ) : (
            <div className="h-[50px] w-[50px]" />
          )
        },
      },
      {
        headerName: 'First Name',
        field: 'firstName',
        editable: true,
        width: 150,
        valueSetter: handleInputChange('firstName'),
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        editable: true,
        width: 150,
        valueSetter: handleInputChange('lastName'),
      },
      {
        headerName: 'Email',
        field: 'email',
        editable: true,
        width: 250,
        valueSetter: handleInputChange('email'),
      },
      {
        headerName: 'Has Artist Profile',
        field: 'hasArtistProfile',
        editable: false,
        width: 150,
        renderCell: (params: GridRenderCellParams) =>
          params.row.hasArtistProfile && <Checkbox checked color="primary" />,
      },
      {
        headerName: 'Last Activity On',
        field: 'lastActivityDate',
        editable: false,
        width: 200,
        renderCell: (params: GridRenderCellParams) =>
          params.row.lastActivityDate
            ? new Date(params.row.lastActivityDate).toLocaleString('en-US')
            : '',
      },
      {
        headerName: 'Enabled',
        field: 'enabled',
        width: 150,
        editable: true,
        renderCell: (params: GridRenderCellParams) => (
          <Checkbox checked={params.row.enabled} color="primary" />
        ),
        renderEditCell: (params: GridRenderCellParams) => (
          <Checkbox
            checked={params.row.enabled}
            onChange={(e, checked) => props.userStore.setEnabled(checked)}
            color="primary"
          />
        ),
      },
      {
        headerName: 'Locked',
        field: 'accountLocked',
        width: 150,
        editable: true,
        renderCell: (params: GridRenderCellParams) => (
          <Checkbox checked={params.row.accountLocked} color="primary" />
        ),
        renderEditCell: (params: GridRenderCellParams) => (
          <Checkbox
            checked={params.row.accountLocked}
            onChange={(e, checked) => props.userStore.setAccountLocked(checked)}
            color="primary"
          />
        ),
      },
      {
        headerName: 'Expired',
        field: 'accountExpired',
        width: 150,
        editable: true,
        renderCell: (params: GridRenderCellParams) => (
          <Checkbox checked={params.row.accountExpired} color="primary" />
        ),
        renderEditCell: (params: GridRenderCellParams) => (
          <Checkbox
            checked={params.row.accountExpired}
            onChange={(e, checked) => props.userStore.setAccountExpired(checked)}
            color="primary"
          />
        ),
      },
      {
        headerName: 'Roles',
        field: 'authorities',
        editable: true,
        width: 150,
        valueSetter: handleInputChange('authorities'),
      },
      {
        headerName: 'Timezone',
        field: 'timezone',
        width: 300,
        editable: true,
        renderEditCell: (props: GridRenderEditCellParams) => {
          return (
            <FormControl fullWidth>
              <Select value={timezone} onChange={handleTimezoneChange}>
                {timezones().map(tz => (
                  <MenuItem key={tz} value={tz}>
                    {tz}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )
        },
      },
      {
        headerName: 'Updated At',
        field: 'updatedDate',
        editable: false,
        width: 200,
        renderCell: (params: GridRenderCellParams) =>
          params.row.updatedDate ? params.row.updatedDate.toLocaleString('en-US') : '',
      },
      {
        headerName: 'Created At',
        field: 'createdDate',
        editable: false,
        width: 200,
        renderCell: (params: GridRenderCellParams) =>
          params.row.createdDate ? params.row.createdDate.toLocaleString('en-US') : '',
      },
    ]
    const data = values(props.data) as UserModel[]

    return (
      <Paper className="w-full overflow-auto rounded-md" elevation={0}>
        <div className="h-full w-full">
          <DataGrid
            autoHeight
            rowHeight={60}
            columns={columns}
            pagination
            rows={data}
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
            onRowEditStart={onSelect}
            onRowEditStop={onRowEditStop}
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
          {/* <EditTrackModal onClose={() => setOpenEditor(false)} /> */}
        </Drawer>
      </Paper>
    )
  })
)

export default EditableUser
