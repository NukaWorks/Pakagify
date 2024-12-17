import { Button, Dialog, FlexLayout, StackLayout, Text, TextField } from "@nwrks/uikit";
import { ChangeEvent, useEffect, useState } from "react";

export function RepositoryCreatorDialog({ open, onClose }: Readonly<{ open: boolean; onClose: () => void }>) {
  const [isValid, setIsValid] = useState(false);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    setProjectName("");
  }, [open]);

  function handleForm(event: ChangeEvent<HTMLInputElement>) {
    setProjectName(event.target.value);
    if (projectName.length > 0) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <FlexLayout direction={"Vertical"} spacing={15}>
        <Text size={13}>Create a new repository</Text>
        <StackLayout direction={"Horizontal"} spacing={5}>
          <TextField
            value={projectName}
            onChange={handleForm}
            invalid={!isValid}
            type={"text"}
            placeholder={"Project Name"}
          />
          <Button color={"Primary"}>Create</Button>
        </StackLayout>
      </FlexLayout>
    </Dialog>
  );
}
