import { Dialog, FlexLayout, Spinner, StackLayout, Text } from "@nwrks/uikit";
import { useState } from "react";
import { GithubRepoFinder } from "../Views/GithubRepoFinder";

export function ProjectExplorerDialog({ open, onClose }: Readonly<{ open: boolean; onClose: () => void }>) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Dialog open={open} onClose={onClose}>
      {!loaded ? (
        <FlexLayout justifyContent={"Center"} alignItems={"Center"} flex={1} /* width={500} height={500} */>
          <Spinner size={"Small"} color={"Blue"} />
        </FlexLayout>
      ) : (
        <StackLayout spacing={15} direction={"Vertical"} /* width={500} height={500} */>
          <Text size={15}>Project Explorer</Text>
          <GithubRepoFinder />
        </StackLayout>
      )}
    </Dialog>
  );
}
