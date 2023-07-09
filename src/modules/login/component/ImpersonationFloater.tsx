import { Button } from '@mui/material'
import { observer } from 'mobx-react'
import React from 'react'
import { getStore } from 'src/common/store'

const ImpersonationFloater = observer(() => {
  return (
    <div className="fixed bottom-0 right-0 mb-6 mr-6 flex w-full max-w-[200px] flex-col items-center justify-center rounded border border-solid border-primary-dark bg-background-main px-4 py-2 shadow-md shadow-gray-600">
      <div className="text-center font-medium">Impersonating</div>
      <div className="text-center text-sm font-medium">{getStore().userStore.user.fullName}</div>
      <Button onClick={getStore().authenticationStore.logout} size="small" className="mt-2">
        Logout
      </Button>
    </div>
  )
})

export default ImpersonationFloater
