import { AppActivity, Button, StackLayout, UiApp } from "@nwrks/uikit";
import Sidebar from "../../Common/UiComponents/Sidebar";

export default function RecentView() {
  // const context = React.useContext(DialogOverlayContext)

  function handleRepository() {
    if (!window.localStorage.getItem("gh-token")) {
      // openDialogOverlay(context, "github-token").then(() => {
      //   console.log("Dialog closed");
      //   if (window.localStorage.getItem("gh-token")) openDialogOverlay(context, "repo-creator");
      // });
    } else if (window.localStorage.getItem("gh-token")) {
      // openDialogOverlay(context, "repo-creator");
    }
  }

  return (
    <AppActivity theme={"Light"} direction={"Horizontal"}>
      <Sidebar direction={"Vertical"}>
        <Button size={"Medium"} color={"Primary"} onClick={handleRepository}>
          Nouveau Repository
        </Button>
        <Button size={"Medium"} onClick={handleRepository}>
          Repository Existant
        </Button>
      </Sidebar>

      <UiApp>
        <div className={"App__Header"}>
          <h1 className={"App__Header--Title"}>Elements Récents</h1>
          <StackLayout direction={"Vertical"}>Nothing goes here</StackLayout>
        </div>
      </UiApp>
    </AppActivity>
  );
}
