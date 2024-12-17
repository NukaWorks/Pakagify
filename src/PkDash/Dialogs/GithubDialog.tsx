import { Button, FlexLayout, StackLayout, Text, TextField } from "@nwrks/uikit";
import { useEffect, useRef, useState } from "react";

export function GithubDialog({ open, onClose }: Readonly<{ open: boolean; onClose: () => void }>) {
  const inputRef = useRef(null);
  const [token, setToken] = useState("");

  // Reset the token when the dialog is closed
  useEffect(() => {
    setToken("");
  }, [open]);

  const validateToken = () => {
    if (token) {
      window.localStorage.setItem("gh-token", token.toString());
      // pakagify = new Pakagify(token) // Refresh Pakagify instance
      onClose();
    }
  };

  const parseToken = () => {
    if (inputRef.current.value.length >= 40 && inputRef.current.value.match("^ghp_[a-zA-Z0-9]{36}$")) {
      setToken(inputRef.current.value);
    } else {
      setToken(null);
    }
  };

  return (
    <FlexLayout direction={"Vertical"} spacing={15}>
      <Text size={15}>Create a Github Token</Text>
      <StackLayout spacing={5}>
        <TextField
          onChange={parseToken}
          invalid={!token}
          ref={inputRef}
          type={"password"}
          placeholder={"Github Token"}
        />
        <Button
          color={"Primary"}
          onClick={() =>
            window.open(
              "https://github.com/settings/tokens/new?description=Pakagify&scopes=repo%2Cgist%2Cread%3Aorg%2Cworkflow"
            )
          }
        >
          Generate
        </Button>
      </StackLayout>

      <FlexLayout justifyContent={"End"} direction={"Horizontal"} spacing={5}>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={!token} color={"Primary"} onClick={validateToken}>
          OK
        </Button>
      </FlexLayout>
    </FlexLayout>
  );
}
