import { Skeleton } from '@mui/material'

import React from 'react'

interface ISkeletonLoader {
  count: number
  type: 'track' | 'table' | 'card' | 'artist'
}

class SkeletonLoader extends React.PureComponent<ISkeletonLoader> {
  public render() {
    const { count, type } = this.props

    return (
      <>
        {type === 'track' &&
          Array(count)
            .fill(0)
            .map((_, id) => (
              <div key={id}>
                <Skeleton variant="rectangular" width="150px" height="150px" />
                <Skeleton variant="text" width="100px" height="10px" />
                <Skeleton variant="text" width="75px" height="10px" />
              </div>
            ))}
        {type === 'card' &&
          Array(count)
            .fill(0)
            .map((_, id) => (
              <div key={id}>
                <Skeleton
                  variant="rectangular"
                  width="250px"
                  height="210px"
                  className="rounded-sm"
                />
              </div>
            ))}
        {type === 'artist' &&
          Array(count)
            .fill(0)
            .map((_, id) => (
              <div key={id}>
                <Skeleton
                  variant="rectangular"
                  width="200px"
                  height="256px"
                  className="rounded-sm"
                />
              </div>
            ))}

        {type === 'table' &&
          Array(count)
            .fill(0)
            .map((_, id) => <Skeleton key={id} variant="text" width="100%" height="50px" />)}
      </>
    )
  }
}

export default SkeletonLoader
