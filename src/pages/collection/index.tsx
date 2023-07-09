import Head from 'next/head'
import React from 'react'
import CollectionsViewer from 'src/modules/collection/components/CollectionsViewer'

const CollectionsPage = () => (
  <div className="flex w-full flex-col p-6 pb-28 sm:p-8">
    <Head>
      <title key="title">Collection</title>
    </Head>
    <CollectionsViewer />
  </div>
)

export default CollectionsPage
