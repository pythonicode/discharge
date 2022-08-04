import {
  Group,
  Stepper,
  Text,
  Button,
  Tooltip,
  Box,
  PasswordInput,
  Progress,
  Popover,
  Checkbox,
  Header,
  Title,
} from '@mantine/core'
import { useEffect, useState } from 'react'
import { Ban, Check, CircleCheck, Copy, Cross, Flag } from 'tabler-icons-react'
import { DirectoryButton, CopyButton } from './styles'
import { useElectron } from '../../providers/ElectronProvider'
import { AES } from 'crypto-js'

export function Onboarding() {
  const { preferences, setPage } = useElectron()

  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (preferences && preferences.uid) return
    window.Main.send('app:preferences:create:uid')
  }, [])

  const chooseDirectory = () => window.Main.send('app:preferences:set:path')

  const copyToClipboard = () => {
    navigator.clipboard.writeText(preferences.uid)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
  ]

  function meets(password: string, requirements: Array<any>) {
    if (password.length < 6) return false
    for (let i = 0; i < requirements.length; i++)
      if (!requirements[i].re.test(password)) return false
    return true
  }

  const submit = async () => {
    setError(true)
    if (password != confirm || !meets(password, requirements) || !checked)
      return
    const key = AES.encrypt(password, preferences.uid).toString()
    window.Main.send('message', key)
    window.Main.send('app:preferences:set:key', key)
  }

  return (
    <>
      {active < 2 && (
        <Stepper active={active} orientation="horizontal" my="md">
          <Stepper.Step />
          <Stepper.Step />
        </Stepper>
      )}
      {active == 0 && (
        <Group direction="column" align="center" sx={{ width: '80vw' }}>
          <Text>Select a directory for your files.</Text>
          <DirectoryButton onClick={chooseDirectory}>
            {preferences ? preferences.path : ''}
          </DirectoryButton>
          <Button onClick={() => setActive(active + 1)} fullWidth>
            Continue
          </Button>
          <Text size="xs" align="left" color="dimmed"></Text>
          <Text size="xs" align="left" color="dimmed">
            We recommend creating a new empty directory.
            <br />
            <br />
            Files saved in this directory will be automatically encrypted and
            uploaded to decentralized storage.
          </Text>
        </Group>
      )}
      {active == 1 && (
        <Group direction="column" align="center" sx={{ width: '80vw' }}>
          <Text>Create your user ID and password.</Text>
          <Tooltip
            label="Copy this Unique ID to sign into your account on other devices."
            wrapLines
            width={250}
            sx={{ width: '100%' }}
          >
            <CopyButton onClick={copyToClipboard}>
              <Copy />
              {copied ? <Text size="sm">Copied!</Text> : <>{preferences.uid}</>}
            </CopyButton>
          </Tooltip>
          <PasswordStrength
            value={password}
            setValue={setPassword}
            requirements={requirements}
            error={error && !meets(password, requirements)}
          />
          <PasswordInput
            placeholder="Confirm Password"
            variant="default"
            value={confirm}
            onChange={event => setConfirm(event.currentTarget.value)}
            sx={{ width: '100%' }}
            error={error && password != confirm}
          />
          <Button onClick={submit} fullWidth>
            Finish
          </Button>
          <Text size="xs" align="left" color="dimmed"></Text>
          <Text size="xs" align="left" color="dimmed">
            Please store your user ID and password in a safe place. You will
            need both of them to access your files on another device.
            <br />
            <br />
            Your password is used to encrypt and decrypt files. If you lose your
            password you lose access to your files.
          </Text>
          <Checkbox
            checked={checked}
            onChange={event => setChecked(event.currentTarget.checked)}
            label="I understand the above information."
            size="xs"
          />
          {error && !checked && (
            <Text color="red" size="xs">
              Please acknowledge and complete the checkbox.
            </Text>
          )}
        </Group>
      )}
    </>
  )
}

function PasswordRequirement({
  meets,
  label,
}: {
  meets: boolean
  label: string
}) {
  return (
    <Text
      color={meets ? 'teal' : 'red'}
      sx={{ display: 'flex', alignItems: 'center' }}
      mt={7}
      size="sm"
    >
      {meets ? <Check /> : <Ban />} <Box ml={10}>{label}</Box>
    </Text>
  )
}

function PasswordStrength({ value, setValue, requirements, error }: any) {
  function getStrength(password: string) {
    let multiplier = password.length > 5 ? 0 : 1

    requirements.forEach((requirement: any) => {
      if (!requirement.re.test(password)) {
        multiplier += 1
      }
    })

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10)
  }

  const [popoverOpened, setPopoverOpened] = useState(false)
  const checks = requirements.map((requirement: any, index: any) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(value)}
    />
  ))

  const strength = getStrength(value)
  const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red'

  return (
    <Popover
      opened={popoverOpened}
      position="bottom"
      placement="start"
      withArrow
      styles={{ popover: { width: '100%' } }}
      trapFocus={false}
      transition="pop-top-left"
      onFocusCapture={() => setPopoverOpened(true)}
      onBlurCapture={() => setPopoverOpened(false)}
      sx={{ width: '100%' }}
      target={
        <PasswordInput
          required
          placeholder="Password"
          variant="default"
          value={value}
          error={error}
          onChange={event => setValue(event.currentTarget.value)}
        />
      }
    >
      <Progress
        color={color}
        value={strength}
        size={5}
        style={{ marginBottom: 10 }}
      />
      <PasswordRequirement
        label="Includes at least 6 characters"
        meets={value.length > 5}
      />
      {checks}
    </Popover>
  )
}
