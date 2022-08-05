<script lang="ts">
  import { Router, Route, Link } from 'svelte-navigator'
  import Start from './pages/Start.svelte'
  import Welcome from './pages/Welcome.svelte'
</script>

<Router>
  <Route path=""><Welcome /></Route>
  <Route path="start"><Start /></Route>
</Router>
