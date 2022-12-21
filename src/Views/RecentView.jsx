import React from 'react'
import { AppActivity, Button, UiApp } from '@powerws/uikit'

export default function RecentView () {
  return (
    <AppActivity theme={'Light'}>
      <div className={'App__SidePanel'}>
        <Button size={'Medium'} color={'Primary'} onClick={() => alert('Caca')}>Nouveau Projet</Button>
        <Button size={'Medium'}>Project Existant</Button>
      </div>

      <UiApp rounded>
        <div className={'App__Header'}>
        <h1 className={'App__Header--Title'}>Elements Récents</h1>
      </div>
      </UiApp>
    </AppActivity>
  )
}
