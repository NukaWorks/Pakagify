import React from 'react'
import { AppActivity, Button, DialogOverlayContext, openDialogOverlay, StackLayout, UiApp } from '@powerws/uikit'
import Sidebar from '../Common/Components/Sidebar'

export default function RecentView () {
  const context = React.useContext(DialogOverlayContext)

  const handleNewRepository = () => {
    if (!window.localStorage.getItem('gh-token')) {
      openDialogOverlay(context, 'github-token').then(() => {
        console.log('Dialog closed')
        if (window.localStorage.getItem('gh-token')) openDialogOverlay(context, 'repo-creator')
      })
    } else if (window.localStorage.getItem('gh-token')) openDialogOverlay(context, 'repo-creator')
  }

  const handleExistingRepository = () => {
    if (!window.localStorage.getItem('gh-token')) {
      openDialogOverlay(context, 'github-token').then(() => {
        if (window.localStorage.getItem('gh-token')) openDialogOverlay(context, 'repo-explorer')
      })
    } else if (window.localStorage.getItem('gh-token')) openDialogOverlay(context, 'repo-explorer')
  }

  return (
    <AppActivity theme={'Light'} direction={'Horizontal'}>
      <Sidebar>
          <Button size={'Medium'} color={'Primary'} onClick={handleNewRepository}>Nouveau Repository</Button>
          <Button size={'Medium'} onClick={handleExistingRepository}>Repository Existant</Button>
      </Sidebar>

      <UiApp>
        <div className={'App__Header'}>
        <h1 className={'App__Header--Title'}>Elements Récents</h1>
          <StackLayout direction={'Vertical'}>
            Nothing goes here
          </StackLayout>
      </div>
      </UiApp>

    </AppActivity>
  )
}
