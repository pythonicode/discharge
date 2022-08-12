<script lang="ts">
  import { Router, Route, navigate } from 'svelte-navigator'
  import Start from './pages/Start.svelte'
  import Welcome from './pages/Welcome.svelte'
  import Main from './pages/Main.svelte'
  import Loading from './pages/Loading.svelte'
  import { connected } from './lib/tauri'

  connected.subscribe((curr) => {
    curr ? navigate('main') : navigate('welcome')
  })
</script>

<Router>
  <Route path=""><Loading /></Route>
  <Route path="welcome"><Welcome /></Route>
  <Route path="start"><Start /></Route>
  <Route path="main"><Main /></Route>
</Router>
