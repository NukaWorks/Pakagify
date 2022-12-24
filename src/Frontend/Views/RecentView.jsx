import React from 'react'
import { AppActivity, Button, DialogOverlayContext, openDialogOverlay, StackLayout, UiApp } from '@powerws/uikit'

// eslint-disable-next-line react/prop-types

export default function RecentView () {
  const context = React.useContext(DialogOverlayContext)

  return (
    <AppActivity theme={'Light'}>
      <div className={'App__SidePanel'}>
        <Button size={'Medium'} color={'Primary'} onClick={() => openDialogOverlay(context, 'github-token')}>Nouveau Projet</Button>
        <Button size={'Medium'}>Project Existant</Button>
      </div>

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
