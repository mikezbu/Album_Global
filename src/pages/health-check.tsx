import React from 'react'

export default function HealthCheck() {
  return <>OK</>
}

HealthCheck.getInitialProps = async ctx => {
  ctx.res.end()
}
