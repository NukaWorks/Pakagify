import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './PkDash/App.jsx'
import './Common/Styling/app.scss'
import '@powerws/uikit/styling'

ReactDOM.createRoot(document.getElementById('root')).render(
   <React.StrictMode>
      <App className={'App'}/>
   </React.StrictMode>
)
