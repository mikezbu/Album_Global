import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { BUGSNAG_API_KEY, DEPLOYMENT_ENVIRONMENT } from 'src/ApplicationConfiguration'
import packageJson from 'package.json'

export function startBugsnag() {
  Bugsnag.start({
    apiKey: BUGSNAG_API_KEY || '22222222222222222222222222222222',
    plugins: [new BugsnagPluginReact()],
    appVersion: packageJson.version,
    enabledReleaseStages: ['production', 'staging'],
    releaseStage: DEPLOYMENT_ENVIRONMENT,
  })
}

export default Bugsnag
