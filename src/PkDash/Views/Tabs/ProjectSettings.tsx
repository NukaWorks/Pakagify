import { Button, FlexLayout, StackLayout, Text, TextField } from "@nwrks/uikit";
import styled from "styled-components";

const SectionElement = styled(FlexLayout)`
  background-color: white;
  border-radius: 5px;
  border: 1px #e5e5e5 solid;
  padding: 1rem;
`;

export default function ProjectSettings() {
  return (
    <StackLayout direction={"Vertical"} spacing={20}>
      <Text size={24} style={{ fontWeight: 700 }}>
        Project Settings
      </Text>

      <SectionElement direction={"Vertical"} spacing={10} width={500}>
        <Text size={16} style={{ fontWeight: 500 }}>
          Overview
        </Text>

        <FlexLayout spacing={5} direction={"Vertical"}>
          <Text size={11}>Project Name</Text>

          <FlexLayout spacing={3}>
            <TextField size={18} placeholder={"My Project"} />
            <Button color={"Primary"}>Update</Button>
          </FlexLayout>
        </FlexLayout>

        <FlexLayout spacing={5} direction={"Vertical"}>
          <Text size={11} disabled>
            Description
          </Text>

          <FlexLayout spacing={3}>
            <TextField disabled size={18} placeholder={"Description"} />
            <Button disabled color={"Primary"}>
              Update
            </Button>
          </FlexLayout>
        </FlexLayout>
      </SectionElement>

      <SectionElement direction={"Vertical"} spacing={10} width={500}>
        <Text size={16} style={{ fontWeight: 500 }}>
          Danger Zone
        </Text>

        <FlexLayout spacing={5} direction={"Vertical"}>
          <Text size={11}>Delete All Releases</Text>
          <Button color={"Alert"}>Delete</Button>
        </FlexLayout>
      </SectionElement>
    </StackLayout>
  );
}
