import React from 'react'
import { AppActivity, StackLayout, Tab, TabList, TabPanel, Tabs, UiApp } from '@powerws/uikit'
import Header from '../../Common/UiComponents/Header'
import ProjectSettings from './Tabs/ProjectSettings'
import Packages from './Tabs/Packages'
import Releases from './Tabs/Releases'

export default function ProjectView () {
  return (
    <AppActivity theme={'Light'} direction={'Vertical'}>
      <Header displayBackground={false} />

      <UiApp>
        <StackLayout direction={'Vertical'}>
          <Tabs>
            <TabList>
              <Tab>Releases</Tab>
              <Tab>Packages</Tab>
              <Tab>Settings</Tab>
            </TabList>

            <TabPanel>
              <Releases />
            </TabPanel>

            <TabPanel>
              <Packages />
            </TabPanel>

            <TabPanel>
              <ProjectSettings />
            </TabPanel>
          </Tabs>
        </StackLayout>
      </UiApp>
    </AppActivity>
  )
}
