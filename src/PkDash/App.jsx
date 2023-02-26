import React, { useEffect, useState } from 'react'
import MainWindow from './Views/MainWindow'
import {
  Button,
  closeDialogOverlay,
  DialogOverlay,
  DialogOverlayContext,
  FlexLayout,
  Link,
  ListView,
  Spinner,
  StackLayout,
  Text,
  TextField
} from '@powerws/uikit'
import { useDetectClickOutside } from 'react-detect-click-outside'
import { Pakagify } from '../Common/Pakagify'

let pakagify = null
if (window.localStorage.getItem('gh-token')) {
  pakagify = new Pakagify(window.localStorage.getItem('gh-token'))
}

const textEllipsisStyle = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }

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
        <Text size={15}>Create a Github Token</Text>
        <StackLayout spacing={5}>
          <TextField onChange={parseToken} invalid={!token} ref={inputRef} type={'password'}
                     placeholder={'Github Token'}/>
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

// Needs to be separated
function GithubRepoFinder () {
  const [data, setData] = useState(null) // TODO Repair GithubRepoFinder fetch

  return (
    <ListView>
      {[...data.entries()].map((repo, index) => (
        <StackLayout key={index} onClick={() => console.log(repo[1].id)} direction={'Vertical'}>
          <Text size={13} color={'#0f93e1'}>{repo[1].full_name}</Text>
          <StackLayout spacing={10}>
            <Text style={textEllipsisStyle}
                  size={10}>{repo[1].description ? repo[1].description : 'No description yet.'}</Text>
            <Text size={10} style={textEllipsisStyle} disabled>{repo[1].visibility}</Text>
          </StackLayout>
        </StackLayout>
      ))}
    </ListView>
  )
}

function ProjectExplorerDialog ({ ...props }) {
  const context = React.useContext(DialogOverlayContext)
  const [loaded, setLoaded] = useState(false)

  return (
    <DialogOverlay name={'repo-explorer'} {...props}>
      {!loaded
        ? (
          <FlexLayout justifyContent={'Center'} alignItems={'Center'} flex={1} width={500} height={500}>
            <Spinner size={'Small'} color={'Blue'}/>
          </FlexLayout>
          )
        : (
          <StackLayout spacing={15} direction={'Vertical'} width={500} height={500}>
            <Text size={15}>Project Explorer</Text>
            <GithubRepoFinder />
          </StackLayout>
          )}
    </DialogOverlay>
  )
}

function AboutDialog ({ ...props }) {
  const context = React.useContext(DialogOverlayContext)

  return (
    <DialogOverlay name={'about'} {...props}>
      <FlexLayout direction={'Vertical'} spacing={15}>
        <Text size={16}>About</Text>
        <StackLayout spacing={5} direction={'Vertical'}>
          <Text size={12} style={{ textAlign: 'center' }}>Pakagify is a simple package creation tool on top of Releases for Github.</Text>
          <Text size={9} style={{ textAlign: 'center' }}>Made by <Link href={'https://github.com/Powerm1nt'}>@Powerm1nt</Link> with ❤️</Text>
        </StackLayout>

        <FlexLayout direction={'Horizontal'} spacing={5} justifyContent={'End'}>
          <Button color={'Primary'} onClick={() => window.open('https://github.com/Powerm1nt', '_blank')}>Github</Button>
          <Button onClick={() => closeDialogOverlay(context)}>Close</Button>
        </FlexLayout>
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
          <TextField onChange={handleForm} invalid={!isValid} ref={inputRef} type={'text'}
                     placeholder={'Project Name'}/>
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
      <AboutDialog contentRef={ref}/>
      <MainWindow/>
    </DialogOverlayContext.Provider>
  )
}
