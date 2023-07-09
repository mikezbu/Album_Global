import Head from 'next/head'
import React from 'react'

import withAuth from 'src/common/components/withAuth'
import LibraryList from 'src/modules/library/components/LibraryList'

const LibraryPage = () => (
  <div className="flex w-full flex-col p-6 pb-28 sm:p-8">
    <Head>
      <title key="title">Library</title>
    </Head>
    <LibraryList initialPageSize={24} />
  </div>
)

export default withAuth(LibraryPage)
