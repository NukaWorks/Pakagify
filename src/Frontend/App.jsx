import React, { useEffect } from 'react'
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
  const [token, setToken] = React.useState(null)

  // Reset the token when the dialog is closed
  useEffect(() => {
    if (context.displayed === '') setToken(null)
  }, [context.displayed])

  const validateToken = () => {
    if (token) {
      window.localStorage.setItem('gh-token', token.toString())
      closeDialogOverlay(context)
    }
  }

  const parseToken = () => {
    if (inputRef.current.value.length >= 40 && inputRef.current.value.match('^ghp_[a-zA-Z0-9]{36}$')) {
      setToken(inputRef.current.value)
    } else {
      setToken(null)
    }
  }

  return (
    <DialogOverlay name={'github-token'} {...props}>
      <FlexLayout direction={'Vertical'} spacing={15}>
        <Text size={13}>Create a Github Token</Text>
        <StackLayout spacing={5}>
          <TextField onChange={parseToken} invalid={!token} ref={inputRef} type={'password'} placeholder={'Github Token'} />
          <Button
            color={'Primary'}
            onClick={() => window.open('https://github.com/settings/tokens/new?description=Pakagify&scopes=repo%2Cgist%2Cread%3Aorg%2Cworkflow')}
          >
            Generate
          </Button>
        </StackLayout>

        <FlexLayout justifyContent={'End'} direction={'Horizontal'} spacing={5}>
          <Button onClick={() => closeDialogOverlay(context)}>Cancel</Button>
          <Button disabled={!token} color={'Primary'} onClick={validateToken}>OK</Button>
        </FlexLayout>
      </FlexLayout>
    </DialogOverlay>
  )
}

function ProjectExplorerDialog ({ ...props }) {
  const context = React.useContext(DialogOverlayContext)

  return (
      <DialogOverlay name={'project-explorer'} {...props}>
         <FlexLayout direction={'Vertical'} spacing={15}>
            <Text size={13}>Project Explorer</Text>
            <StackLayout spacing={5}>
               <TextField onChange={() => {}} invalid={false} ref={null} type={'text'} placeholder={'Project Name'} />
            </StackLayout>
         </FlexLayout>
      </DialogOverlay>
  )
}

function RepositoryCreatorDialog ({ ...props }) {
  const context = React.useContext(DialogOverlayContext)

  return (
      <DialogOverlay name={'repo-creator'} {...props}>
         <FlexLayout direction={'Vertical'} spacing={15}>
            <Text size={13}>Create a new repository</Text>
            <StackLayout spacing={5}>
               <TextField onChange={() => {}} invalid={false} ref={null} type={'text'} placeholder={'Project Name'} />
            </StackLayout>
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
      <RepositoryCreatorDialog contentRef={ref}/>
      <ProjectExplorerDialog contentRef={ref}/>
      <MainWindow />
    </DialogOverlayContext.Provider>
  )
}
