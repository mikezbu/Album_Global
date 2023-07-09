import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { inject, observer } from 'mobx-react'
import Head from 'next/head'
import Router from 'next/router'
import React from 'react'

import SkeletonLoader from 'src/common/components/SkeletonLoader'
import { SamplePackStore } from 'src/common/store'
import CollectionCard from 'src/modules/collection/components/CollectionCard'
import CollectionModel from 'src/modules/collection/store/model/CollectionModel'

const PREFIX = 'index'

const classes = {
  container: `${PREFIX}-container`,
  header: `${PREFIX}-header`,
  samplePackContainer: `${PREFIX}-samplePackContainer`,
}

const Root = styled('div')(() => ({
  [`&.${classes.container}`]: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    padding: '1.5em 2em 0.5em',

    '@media screen and (max-width: 600px)': {
      padding: '1em 1em 0.5em 1em',
    },
  },

  [`& .${classes.header}`]: {},

  [`& .${classes.samplePackContainer}`]: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',

    '&:after': {
      content: '""',
      flex: 'auto',
      width: '100%',
    },
  },
}))

interface IIndex {
  samplePackStore: SamplePackStore
}

const Index = inject('samplePackStore')(
  observer(
    class Index extends React.Component<IIndex> {
      public state = {}

      private readonly _samplePackStore: SamplePackStore

      constructor(props: IIndex) {
        super(props)

        this._samplePackStore = props.samplePackStore
        this._samplePackStore.setPageSize(48)
        this._samplePackStore.fetchSamplePacks()
      }

      public render() {
        const samplePacks = []

        this._samplePackStore.samplePacks.forEach((collection: CollectionModel) => {
          samplePacks.push(
            <CollectionCard
              collection={collection}
              key={collection.id}
              handleClick={this.handleClick}
            />
          )
        })

        return (
          <Root className={classes.container}>
            <Head>
              <title key="title">Sample packs</title>
            </Head>
            <Typography variant="h6" className={classes.header}>
              Sample packs
            </Typography>
            {this._samplePackStore.loading ? (
              <div className={classes.samplePackContainer}>
                <SkeletonLoader count={12} type="card" />
              </div>
            ) : (
              <div className={classes.samplePackContainer}>{samplePacks}</div>
            )}
          </Root>
        )
      }

      private handleClick = (collectionId: number) => {
        Router.push('/sample-pack/[collectionId]', `/sample-pack/${collectionId}`)
      }
    }
  )
)

export default Index
