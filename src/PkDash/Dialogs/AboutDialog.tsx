import { Button, Dialog, FlexLayout, Link, StackLayout, Text } from "@nwrks/uikit";

export function AboutDialog({ open, onClose }: Readonly<{ open: boolean; onClose: () => {} }>) {
  return (
    <Dialog open={open} onClose={onClose}>
      <FlexLayout direction={"Vertical"} spacing={15}>
        <Text size={16}>About</Text>
        <StackLayout spacing={5} direction={"Vertical"}>
          <Text size={12} style={{ textAlign: "center" }}>
            Pakagify is a simple package creation tool on top of Releases for Github.
          </Text>
          <Text size={9} style={{ textAlign: "center" }}>
            Made by <Link href={"https://github.com/Powerm1nt"}>@Powerm1nt</Link> with ❤️
          </Text>
        </StackLayout>

        <FlexLayout direction={"Horizontal"} spacing={5} justifyContent={"End"}>
          <Button color={"Primary"} onClick={() => window.open("https://github.com/Powerm1nt", "_blank")}>
            Github
          </Button>
          <Button onClick={onClose}>Close</Button>
        </FlexLayout>
      </FlexLayout>
    </Dialog>
  );
}
