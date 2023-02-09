import React from 'react'
import { AppActivity, StackLayout, Tab, TabList, TabPanel, Tabs, UiApp } from '@powerws/uikit'
import Header from '../Common/Components/Header'
import ProjectSettings from './Tabs/ProjectSettings'
import Packages from './Tabs/Packages'
import Artifacts from './Tabs/Artifacts'

export default function ProjectView () {
  return (
    <AppActivity theme={'Light'} direction={'Vertical'}>
      <Header displayBackground={false} />

      <UiApp>
        <StackLayout direction={'Vertical'}>
          <Tabs>
            <TabList>
              <Tab>Artifacts</Tab>
              <Tab>Packages</Tab>
              <Tab>Settings</Tab>
            </TabList>

            <TabPanel>
              <Artifacts />
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
