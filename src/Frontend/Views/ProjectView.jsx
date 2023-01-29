import React from 'react'
import { AppActivity, AppHeader, Button, FlexLayout, Menu, MenuBar, MenuItem, MenuList, UiApp } from '@powerws/uikit'
import { commercial_name } from '../../../package.json'

export default function ProjectView () {
  return (
    <AppActivity theme={'Light'} direction={'Vertical'}>
      <AppHeader title={'Pakagify'} style={{ paddingBlock: 20 }}>
        <FlexLayout justifyContent={'Space-Between'} style={{ width: '100%' }}>
          <MenuBar>
            <Menu title={'Actions'}>
              <MenuList>
                <MenuItem>New Package...</MenuItem>
                <MenuItem>Open & Analyze repository...</MenuItem>
                <MenuItem>Build Package</MenuItem>
                <MenuItem>Sync Repository</MenuItem>
                <MenuItem>Push Changes...</MenuItem>
              </MenuList>
            </Menu>

            <Menu title={'Help'}>
              <MenuList>
                <MenuItem>Getting Help...</MenuItem>
                <MenuItem>About {commercial_name}...</MenuItem>
              </MenuList>
            </Menu>
          </MenuBar>

          <div style={{ display: 'flex', gap: 3 }}>
            <Button color={'Primary'}>Build</Button>
            <Button color={'Warning'}>Sync</Button>
            <Button color={'Alert'}>Push</Button>
          </div>
        </FlexLayout>
      </AppHeader>

      <UiApp>

      </UiApp>
    </AppActivity>
  )
}
