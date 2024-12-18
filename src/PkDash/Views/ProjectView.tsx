import { AppActivity, StackLayout, Tab, TabList, TabPanel, Tabs, UiApp } from "@nwrks/uikit";
import { Header } from "../../Common/UiComponents/Header";
import ProjectSettings from "./Tabs/ProjectSettings";
import { Releases } from "./Tabs/Releases";
import { Packages } from "./Tabs/Packages";
import { useState } from "react";

export default function ProjectView() {
  const [tabSelected, setTabSelected] = useState(0);

  function handleChangeTab(event: number) {
    console.log("handleChangeTab() called:", event);
    setTabSelected(event);
  }

  return (
    <AppActivity theme={"Light"} direction={"Vertical"}>
      <Header displayBackground={false} />

      <UiApp>
        <StackLayout direction={"Vertical"}>
          <Tabs defaultIndex={0} selectedIndex={tabSelected} onSelect={handleChangeTab}>
            <TabList>
              <Tab id={"releases"}>Releases</Tab>
              <Tab id={"packages"}>Packages</Tab>
              <Tab id={"settings"}>Settings</Tab>
            </TabList>

            <TabPanel id={"releases"}>
              <Releases />
            </TabPanel>

            <TabPanel id={"packages"}>
              <Packages />
            </TabPanel>

            <TabPanel id={"settings"}>
              <ProjectSettings />
            </TabPanel>
          </Tabs>
        </StackLayout>
      </UiApp>
    </AppActivity>
  );
}
