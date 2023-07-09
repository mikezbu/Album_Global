import { Button } from '@mui/material'
import Head from 'next/head'
import React from 'react'

import { purgeExpiredFileCatalog } from 'src/common/api/file-catalog'
import withAuth from 'src/common/components/withAuth'
import { getStore } from 'src/common/store'
import { MessageVariant } from 'src/common/store/AppState'
import AdminArtistList from 'src/modules/artist/components/AdminArtistList'
import { Role } from 'src/modules/login/store'

class Index extends React.Component {
  public state = {
    artistCreateModalOpen: false,
  }

  public render() {
    return (
      <div className="flex w-full flex-col p-6 pb-28 sm:p-8">
        <Head>
          <title key="title">Manage Artists</title>
        </Head>
        <Button
          aria-label="purge file catalog"
          variant="contained"
          color="primary"
          onClick={this.deleteExpiredFileCatalogs}
          className="mb-8 self-end"
          size="small"
        >
          Purge Old File Catalogs
        </Button>
        {/*
        <Modal
          content={
            <ArtistModify createArtist={true} />
          }
          onClose={this.onCloseModal}
          open={this.state.artistCreateModalOpen}
          title="Create an artist"
          fullWidth
          maxWidth="lg"
        /> */}
        <AdminArtistList initialPageSize={24} />
      </div>
    )
  }

  // private onOpenArtistModal = () => {
  //   this.setState({ artistCreateModalOpen: true })
  // }

  // private onCloseModal = () => {
  //   this.setState({ artistCreateModalOpen: false })
  // }

  private deleteExpiredFileCatalogs = () => {
    purgeExpiredFileCatalog(() => {
      getStore().appState.setShowMessage(true)
      getStore().appState.setMessageVariant(MessageVariant.Success)
      getStore().appState.setMessage('File catalog purged successfully!')
    })
  }
}

export default withAuth(Index, Role.SuperAdmin)
