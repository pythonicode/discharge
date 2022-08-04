import {
  Accordion,
  Group,
  Skeleton,
  Text,
  createStyles,
  ActionIcon,
  Tooltip,
  ScrollArea,
  TextInput,
} from '@mantine/core'
import { useEffect, useState } from 'react'
import {
  File as FileIcon,
  Download,
  Folder,
  Trash,
  X,
  Refresh,
} from 'tabler-icons-react'

function File({ item, path, filter }: any) {
  const [exists, setExists] = useState(item.exists)
  const [loading, setLoading] = useState(false)
  const [hidden, setHidden] = useState(false)

  const removed = () => {
    setExists(false)
    setLoading(false)
  }

  const loaded = () => {
    setExists(true)
    setLoading(false)
  }

  useEffect(() => {
    window.Main.on(
      `client:file:removed:${
        path.replace(/\//g, '\\') + item.name.slice(0, item.name.length - 4)
      }`,
      removed
    )

    window.Main.on(
      `client:file:loaded:${(path + item.name).replace(/\//g, '\\')}`,
      loaded
    )

    return () => {
      window.Main.removeEventListener(
        `client:file:removed:${
          path.replace(/\//g, '\\') + item.name.slice(0, item.name.length - 4)
        }`
      )
      window.Main.removeEventListener(
        `client:file:loaded:${(path + item.name).replace(/\//g, '\\')}`
      )
    }
  }, [])

  if (!item.name.toLowerCase().includes(filter.trim().toLowerCase()))
    return null
  else if (hidden) return null

  return (
    <Group position="apart" py="xs" px="md" sx={{ width: '100%' }}>
      <Group sx={{ maxWidth: '80%', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <FileIcon size="16px" />
        <Tooltip label={item.name.slice(0, item.name.length - 4)}>
          <Text sx={{ cursor: 'pointer' }}>
            {item.name.length > 24
              ? item.name.slice(0, item.name.length - 4).slice(0, 24) + '...'
              : item.name.slice(0, item.name.length - 4)}
          </Text>
        </Tooltip>
      </Group>

      <Group>
        {exists ? (
          <Tooltip label="Remove from device">
            <ActionIcon
              size="sm"
              loading={loading}
              onClick={() => {
                setLoading(true)
                window.Main.send(
                  'app:file:remove',
                  path + item.name.slice(0, item.name.length - 4)
                )
              }}
            >
              <X />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Tooltip label="Download file to device">
            <ActionIcon
              size="sm"
              loading={loading}
              onClick={() => {
                setLoading(true)
                window.Main.send('app:file:download', {
                  file: item,
                  directory: path,
                })
              }}
            >
              <Download />
            </ActionIcon>
          </Tooltip>
        )}
        <Tooltip label="Remove permanently">
          <ActionIcon size="xs" onClick={() => setHidden(true)}>
            <Trash />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  )
}

function Directory({ item, path, filter }: any) {
  const [loaded, setLoaded] = useState(false)
  const [data, setData] = useState<Array<any> | null>(null)

  const { classes } = createStyles((theme, _params, getRef) => ({
    content: {
      padding: 0,
    },
    contentInner: {
      padding: 0,
    },
  }))()

  const refresh = () => {
    setData(window.Main.sendSync('app:files:get', path + item.name))
    setLoaded(true)
  }

  const Label = ({ name }: any) => {
    return (
      <Group position="apart">
        <Text>
          {name.length > 20 ? item.name.slice(0, 20) + '...' : item.name}
        </Text>
        {/* <Group>
          {item.exists ? (
            <Tooltip label="Remove from device">
              <ActionIcon size="sm">
                <X />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Tooltip label="Download folder">
              <ActionIcon size="sm">
                <Download />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Delete folder">
            <ActionIcon size="sm">
              <Trash />
            </ActionIcon>
          </Tooltip>
        </Group> */}
      </Group>
    )
  }

  if (
    !item.name.toLowerCase().includes(filter.trim().toLowerCase()) &&
    (!data ||
      data.every(
        element =>
          !element.name.toLowerCase().includes(filter.trim().toLowerCase())
      ))
  )
    return null

  return (
    <Accordion sx={{ width: '100%' }}>
      <Accordion.Item
        onTransitionEnd={refresh}
        icon={<Folder size="16px" />}
        label={<Label name={item.name} />}
        classNames={classes}
      >
        {!loaded || data === null ? (
          <>
            <Skeleton width="90%" height="20px" m="md" />
            <Skeleton width="90%" height="20px" m="md" />
            <Skeleton width="90%" height="20px" m="md" />
          </>
        ) : (
          <>
            {data.map((itm: any, i: number) => {
              if (itm.type == 'directory')
                return (
                  <Directory
                    key={i}
                    item={itm}
                    path={path + item.name + '/'}
                    filter={filter}
                  />
                )
            })}
            {data.map((itm: any, i: number) => {
              if (itm.type == 'file')
                return (
                  <File
                    key={i}
                    item={itm}
                    path={path + item.name + '/'}
                    filter={filter}
                  />
                )
            })}
          </>
        )}
      </Accordion.Item>
    </Accordion>
  )
}

function Display({ data, filter, refresh }: any) {
  return (
    <>
      {data.length == 0 ? (
        <Group
          direction="column"
          align="center"
          sx={{ width: '100%', height: '100%', justifyContent: 'center' }}
        >
          <Folder size="50px" color="#999999" />
          <Text size="sm" color="dimmed">
            Nothing here! <br /> Add files to get started.
          </Text>
        </Group>
      ) : (
        <ScrollArea
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '75vh',
            width: '100%',
            paddingRight: '0.75rem',
            flexGrow: 1,
          }}
        >
          {data.map((itm: any, i: number) => {
            if (itm.type == 'directory')
              return <Directory key={i} item={itm} path={'/'} filter={filter} />
          })}
          {data.map((itm: any, i: number) => {
            if (itm.type == 'file')
              return <File key={i} item={itm} path={'/'} filter={filter} />
          })}
        </ScrollArea>
      )}
    </>
  )
}

export function Files() {
  const [filter, setFilter] = useState('')

  const [loaded, setLoaded] = useState(false)
  const [data, setData] = useState(null)

  const refresh = () => {
    setLoaded(false)
    setData(window.Main.sendSync('app:files:get', '/'))
    setLoaded(true)
  }

  useEffect(() => {
    setData(window.Main.sendSync('app:files:get', '/'))
    window.Main.on('client:refresh', refresh)
    setLoaded(true)
    return () => window.Main.removeEventListener('client:refresh')
  }, [])

  return (
    <Group
      direction="column"
      position="center"
      align="center"
      sx={{ width: '100vw', flexGrow: 1 }}
      spacing={0}
    >
      <Group px="md" sx={{ width: '100%', borderBottom: '1px solid #333333' }}>
        <TextInput
          size="md"
          variant="unstyled"
          placeholder="Search"
          value={filter}
          onChange={e => setFilter(e.currentTarget.value)}
          sx={{ flexGrow: 1 }}
        />
        <Tooltip label="Refresh">
          <ActionIcon onClick={refresh}>
            <Refresh />
          </ActionIcon>
        </Tooltip>
      </Group>
      {!loaded ? (
        <>
          <Skeleton width="90%" height="8vh" p="md" />
          <Skeleton width="90%" height="8vh" p="md" />
          <Skeleton width="90%" height="8vh" p="md" />
          <Skeleton width="90%" height="8vh" p="md" />
          <Skeleton width="90%" height="8vh" p="md" />
          <Skeleton width="90%" height="8vh" p="md" />
          <Skeleton width="90%" height="8vh" p="md" />
        </>
      ) : (
        <Display data={data} filter={filter} refresh={refresh} />
      )}
    </Group>
  )
}
