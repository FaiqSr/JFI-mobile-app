import React from 'react';
import { registerRootComponent } from 'expo';

import App from './App';
import { AlertModalHost } from './src/component/common/AlertModalHost';
import { CsPdfModalHost } from './src/component/common/CsPdfModalHost';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately.
//
// The alert host and the CS/SO PDF viewer are siblings of App so App's early
// returns (loading, login, logged in) cannot unmount them. Plain createElement:
// JSX is not parsed in .js here.
const Root = () =>
  React.createElement(
    React.Fragment,
    null,
    React.createElement(App),
    React.createElement(AlertModalHost),
    React.createElement(CsPdfModalHost)
  );

registerRootComponent(Root);
