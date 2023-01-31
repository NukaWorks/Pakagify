import React from 'react'
import {
  AppHeader,
  Button,
  DialogOverlayContext,
  FlexLayout,
  Menu,
  MenuBar,
  MenuItem,
  MenuList,
  openDialogOverlay
} from '@powerws/uikit'
import { commercial_name } from '../../../../package.json'
import PropTypes from 'prop-types'

export default function Header ({ displayBackground }) {
  const context = React.useContext(DialogOverlayContext)

  return (
    <AppHeader title={'Pakagify'} style={{ paddingBlock: 25 }} displayBackground={displayBackground}>
      <FlexLayout justifyContent={'Space-Between'} style={{ width: '100%' }}>
        <MenuBar>
          <Menu title={'Actions'}>
            <MenuList>
              <MenuItem onClick={() => window.localStorage.getItem('gh-token') && openDialogOverlay(context, 'repo-creator')}>New...</MenuItem>
              <MenuItem>Open Repository...</MenuItem>
              <MenuItem>Build Project</MenuItem>
              <MenuItem>Sync Repository</MenuItem>
              <MenuItem>Push Changes...</MenuItem>
              <MenuItem>Close Project</MenuItem>
            </MenuList>
          </Menu>

          <Menu title={'Edit'}>
            <MenuList>
               <MenuItem>Undo Action</MenuItem>
               <MenuItem>Redo Action</MenuItem>
            </MenuList>
          </Menu>

          <Menu title={'Help'}>
            <MenuList>
              <MenuItem>Getting Help...</MenuItem>
              <MenuItem onClick={() => openDialogOverlay(context, 'about')}>About {commercial_name}...</MenuItem>
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
  )
}

Header.propTypes = {
  displayBackground: PropTypes.bool
}
