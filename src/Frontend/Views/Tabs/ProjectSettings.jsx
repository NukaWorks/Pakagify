import React from 'react'
import { Button, FlexLayout, StackLayout, Text, TextField } from '@powerws/uikit'
import styled from 'styled-components'

const SectionElement = styled(FlexLayout)`
  background-color: white;
  border-radius: 5px;
  border: 1px #e5e5e5 solid;
`

export default function ProjectSettings () {
  return (
    <StackLayout direction={'Vertical'} spacing={20}>
      <Text size={24} style={{ fontWeight: 700 }}>Project Settings</Text>

      <SectionElement direction={'Vertical'} spacing={5} width={500}>
        <Text size={14} style={{ fontWeight: 500 }}>Overview</Text>

        <FlexLayout spacing={5} direction={'Vertical'}>
          <Text size={11}>Project Name</Text>

          <FlexLayout spacing={3}>
            <TextField size={18} placeholder={'My Project'} />
            <Button color={'Primary'}>Update</Button>
          </FlexLayout>
        </FlexLayout>

        <FlexLayout spacing={5} direction={'Vertical'}>
          <Text size={11} disabled>Description</Text>

          <FlexLayout spacing={3}>
            <TextField disabled size={18} placeholder={'Description'} />
            <Button disabled color={'Primary'}>Update</Button>
          </FlexLayout>
        </FlexLayout>
      </SectionElement>

      <SectionElement direction={'Vertical'} spacing={5} width={500}>
        <Text size={14} style={{ fontWeight: 500 }}>Danger Zone</Text>

        <FlexLayout spacing={5} alignItems={'Center'}>
          <Text size={11}>Delete Project</Text>
          <Button color={'Alert'}>Delete</Button>
        </FlexLayout>
      </SectionElement>
    </StackLayout>
  )
}
