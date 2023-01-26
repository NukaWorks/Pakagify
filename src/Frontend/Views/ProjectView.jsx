import React from 'react'
import { AppActivity, Button, StackLayout, Text, UiApp } from '@powerws/uikit'
import Sidebar from '../Common/Components/Sidebar'

export default function ProjectView () {
  return (
    <AppActivity theme={'Light'}>
      <Sidebar direction={'Horizontal'}>
        <Text>Menu goes here...</Text>
      </Sidebar>

      <UiApp>
          <StackLayout direction={'Horizontal'} className={'Toolbar'} style={{ paddingBlock: 10, gap: 5 }}>
            <Button>New</Button>
            <Button>Open</Button>
            <Button color={'Primary'}>Build</Button>
            <Button color={'Warning'}>Sync</Button>
            <Button color={'Alert'}>Push</Button>
          </StackLayout>
      </UiApp>
    </AppActivity>
  )
}
