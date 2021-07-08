import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'

import HomeScreen from './HomeScreen'
import DownloadsScreen from './DownloadsScreen'

const Routes: React.FC = () => {
  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" component={HomeScreen} />
        <Route exact path="/downloads" component={DownloadsScreen} />
      </Switch>
    </HashRouter>
  )
}

export default Routes
