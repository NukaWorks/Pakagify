import React from 'react'
import { AppActivity, Button, UiApp } from '@powerws/uikit'

export default function RecentView () {
  return (
    <AppActivity theme={'Light'}>
      <div className={'App--SidePanel'}>
        <Button size={'Medium'} color={'Primary'}>Nouveau Projet</Button>
        <Button size={'Medium'}>Project Existant</Button>
      </div>

      <UiApp rounded>
        <div className={'App--Header'}>
        <h1 className={'App--Header__Title'}>Elements Récents</h1>
      </div>
      </UiApp>
    </AppActivity>
  )
}
