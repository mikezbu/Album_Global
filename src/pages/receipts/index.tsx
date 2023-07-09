import Head from 'next/head'
import React from 'react'

import withAuth from 'src/common/components/withAuth'
import TransactionList from 'src/modules/transactions/components/TransactionList'

const ReceiptsPage = () => (
  <div className="flex w-full flex-col p-6 pb-28 sm:p-8">
    <Head>
      <title key="title">Receipts</title>
    </Head>
    <TransactionList initialPageSize={24} />
  </div>
)

export default withAuth(ReceiptsPage)
