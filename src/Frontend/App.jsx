import React from 'react'
import MainWindow from './Views/MainWindow'
import {
  Button,
  closeDialogOverlay,
  DialogOverlay,
  DialogOverlayContext,
  FlexLayout,
  StackLayout,
  Text,
  TextField
} from '@powerws/uikit'
import { useDetectClickOutside } from 'react-detect-click-outside'

function GithubDialog ({ ...props }) {
  const context = React.useContext(DialogOverlayContext)
  const inputRef = React.useRef(null)

  const handleToken = () => {
    console.log(inputRef.current.value)
    closeDialogOverlay(context)
  }

  return (
    <DialogOverlay name={'github-token'} {...props}>
      <FlexLayout direction={'Vertical'} spacing={15}>
        <Text size={13}>Create a Github Token</Text>
        <StackLayout spacing={5}>
          <TextField ref={inputRef} type={'password'} placeholder={'Github Token'} />
          <Button color={'Primary'}
                  onClick={() => window.open('https://github.com/settings/tokens/new?description=Pakagify&scopes=repo%2Cgist%2Cread%3Aorg%2Cworkflow')}
          >
            Generate
          </Button>
        </StackLayout>

        <FlexLayout justifyContent={'End'} direction={'Horizontal'} spacing={5}>
          <Button onClick={() => closeDialogOverlay(context)}>Cancel</Button>
          <Button color={'Primary'} onClick={handleToken}>OK</Button>
        </FlexLayout>
      </FlexLayout>
    </DialogOverlay>
  )
}

export default function App () {
  const [displayed, setDisplayed] = React.useState('')
  const ref = useDetectClickOutside({ onTriggered: async () => setDisplayed('') })

  return (
    <DialogOverlayContext.Provider value={{ displayed, setDisplayed }}>
      <GithubDialog contentRef={ref}/>
      <MainWindow />
    </DialogOverlayContext.Provider>
  )
}
