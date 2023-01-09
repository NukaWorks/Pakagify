import React, { useEffect, useState } from 'react'
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
import { Pakagify } from '../Backend/Pakagify'

let pakagify = null
if (window.localStorage.getItem('gh-token')) {
  pakagify = new Pakagify(window.localStorage.getItem('gh-token'))
}

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
      pakagify = new Pakagify(token) // Refresh Pakagify instance
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

  useEffect(() => {
    if (context.displayed === 'repo-explorer') {
      pakagify.getRepos().then(r => {
        console.log(r)
      })
    }
  }, [context.displayed])

  return (
      <DialogOverlay name={'repo-explorer'} {...props}>
         <FlexLayout direction={'Vertical'} spacing={15}>
            <Text size={13}>Project Explorer</Text>
            <StackLayout spacing={5}>
               <StackLayout direction={'Horizontal'}>

               </StackLayout>
            </StackLayout>
         </FlexLayout>
      </DialogOverlay>
  )
}

function RepositoryCreatorDialog ({ ...props }) {
  const context = React.useContext(DialogOverlayContext)
  const inputRef = React.useRef(null)
  const [isValid, setIsValid] = useState(false)

  // Reset isValid when the dialog is closed
  useEffect(() => {
    if (context.displayed === '') setIsValid(null)
  }, [context.displayed])

  const handleForm = () => {
    if (inputRef.current.value.length > 0) setIsValid(true)
    else setIsValid(false)
  }

  return (
      <DialogOverlay name={'repo-creator'} {...props}>
         <FlexLayout direction={'Vertical'} spacing={15}>
            <Text size={13}>Create a new repository</Text>
            <StackLayout spacing={5}>
               <TextField onChange={handleForm} invalid={!isValid} ref={inputRef} type={'text'} placeholder={'Project Name'} />
              <Button color={'Primary'}>Create</Button>
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
