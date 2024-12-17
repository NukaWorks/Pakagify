import { useState } from "react";
import { AppHeader, Button, FlexLayout, Menu, MenuBar, MenuItem, MenuList } from "@nwrks/uikit";
import { commercial_name } from "../../../package.json";
import { AboutDialog } from "../../PkDash/Dialogs/AboutDialog";
import { RepositoryCreatorDialog } from "../../PkDash/Dialogs/RepositoryCreatorDialog";
import { ProjectExplorerDialog } from "../../PkDash/Dialogs/ProjectExplorerDialog";

export function Header({ displayBackground }: Readonly<{ displayBackground: boolean }>) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [openRepoCreator, setOpenRepoCreator] = useState(false);
  const [projectExplorerOpen, setProjectExplorerOpen] = useState(false);

  return (
    <AppHeader title={"Pakagify"} style={{ paddingBlock: 25 }} displayBackground={displayBackground}>
      <FlexLayout direction={"Horizontal"} justifyContent={"Space-Between"} flex={1}>
        <MenuBar>
          <Menu title={"Actions"}>
            <MenuList>
              <MenuItem onClick={() => setOpenRepoCreator(true)}>New...</MenuItem>
              <MenuItem onClick={() => setProjectExplorerOpen(true)}>Open Repository...</MenuItem>
              <MenuItem>Build Project</MenuItem>
              <MenuItem>Sync Repository</MenuItem>
              <MenuItem>Push Changes...</MenuItem>
              <MenuItem>Close Project</MenuItem>
            </MenuList>
          </Menu>

          <Menu title={"Edit"}>
            <MenuList>
              <MenuItem>Undo Action</MenuItem>
              <MenuItem>Redo Action</MenuItem>
            </MenuList>
          </Menu>

          <Menu title={"Help"}>
            <MenuList>
              <MenuItem>Getting Help...</MenuItem>
              <MenuItem onClick={() => setAboutOpen(true)}>About {commercial_name}...</MenuItem>
            </MenuList>
          </Menu>
        </MenuBar>

        <div style={{ display: "flex", gap: 3 }}>
          <Button color={"Primary"}>Build</Button>
          <Button color={"Warning"}>Sync</Button>
          <Button color={"Alert"}>Push</Button>
        </div>
      </FlexLayout>

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <RepositoryCreatorDialog open={openRepoCreator} onClose={() => setOpenRepoCreator(false)} />
      <ProjectExplorerDialog open={projectExplorerOpen} onClose={() => setProjectExplorerOpen(false)} />
    </AppHeader>
  );
}
