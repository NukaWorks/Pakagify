import React from 'react'
import { AppActivity, StackLayout, Text, UiApp } from '@powerws/uikit'
import Sidebar from '../Common/Components/Sidebar'

export default function ProjectView () {
  return (
    <AppActivity theme={'Light'}>
      <Sidebar direction={'Horizontal'}>
        <Text>Menu goes here...</Text>
      </Sidebar>

      <UiApp>
        <div className={'App__Header'}>
          <h1 className={'App__Header--Title'}>Proj</h1>
          <StackLayout direction={'Vertical'}>
            Nothing goes here
          </StackLayout>
        </div>
      </UiApp>
    </AppActivity>
  )
}
