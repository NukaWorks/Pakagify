import React from 'react'
import { AppActivity } from '@powerws/uikit'
import PropTypes from 'prop-types'

export default function Application ({ children, theme, direction, ...props }) {
  return (
    <AppActivity theme={theme}>
      {children}
    </AppActivity>
  )
}

Application.propTypes = {
  children: PropTypes.any,
  theme: PropTypes.string,
  direction: PropTypes.string
}

Application.defaultProps = {
  theme: 'Light',
  direction: 'Horizontal'
}
