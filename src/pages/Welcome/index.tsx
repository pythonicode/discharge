import logo from '../../images/logo.png'
import {
  Group,
  Button,
  Divider,
  Text,
  TextInput,
  PasswordInput,
} from '@mantine/core'
import { useState } from 'react'
import { AES } from 'crypto-js'
import { useElectron } from '../../providers/ElectronProvider'

export function Welcome() {
  const uuid =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/

  const { setPage } = useElectron()

  const [id, setId] = useState('')
  const [idError, setIdError] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [confirmError, setConfirmError] = useState(false)

  const updatePreferences = () => {
    if (!uuid.test(id.trim())) setIdError(true)
    if (password.length < 6) setPasswordError(true)
    if (confirm != password) setConfirmError(true)
    const key = AES.encrypt(password, id).toString()
    window.Main.send('app:preferences:set:uid', id)
    window.Main.send('app:preferences:set:key', key)
  }

  return (
    <Group
      align="center"
      direction="column"
      sx={{ width: '80%', height: '100%', justifyContent: 'center' }}
    >
      <img src={logo} alt="Discharge Logo" width="100px" />
      <Button onClick={() => setPage('onboarding')} mt="lg" fullWidth>
        Create a New Account
      </Button>
      <Divider
        label="or"
        variant="solid"
        labelPosition="center"
        sx={{ width: '100%' }}
      />
      <Text>Import an Existing Account</Text>
      <TextInput
        value={id}
        onChange={event => {
          setIdError(false)
          setId(event.target.value)
        }}
        error={idError}
        placeholder="User ID"
        sx={{ width: '100%' }}
      />
      <PasswordInput
        value={password}
        onChange={event => {
          setPasswordError(false)
          setPassword(event.target.value)
        }}
        error={passwordError}
        placeholder="Password"
        sx={{ width: '100%' }}
      />
      <PasswordInput
        value={confirm}
        onChange={event => {
          setConfirmError(false)
          setConfirm(event.target.value)
        }}
        error={confirmError}
        placeholder="Confirm Password"
        sx={{ width: '100%' }}
      />
      <Button onClick={updatePreferences} variant="light" fullWidth>
        Continue
      </Button>
    </Group>
  )
}
