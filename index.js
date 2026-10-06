import React from 'react';
import { registerRootComponent } from 'expo';

import App from './App';
import { AlertModalHost } from './src/component/common/AlertModalHost';
import { LanguageProvider } from './src/i18n';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately.
//
// The language provider wraps everything (incl. the alert host) so the selected
// language applies to all early-return states of App. The alert host is a sibling
// of App so App's early returns cannot unmount it. Plain createElement: JSX is
// not parsed in .js here.
const Root = () =>
  React.createElement(
    LanguageProvider,
    null,
    React.createElement(App),
    React.createElement(AlertModalHost)
  );

registerRootComponent(Root);
