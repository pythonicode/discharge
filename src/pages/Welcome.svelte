<script>
  import Plus from 'svelte-material-icons/Plus.svelte'
  import Upload from 'svelte-material-icons/Upload.svelte'
  import { Link } from 'svelte-navigator'
</script>

<div class="flex flex-col items-center justify-center gap-4 h-full">
  <h1 class="font-bold text-5xl mb-8 select-none">Discharge</h1>
  <Link to="/start" class="w-4/5">
    <button class="w-full"><Plus size="1.5em" /> Create a New Wallet</button>
  </Link>
  <div class="flex flex-row items-center justify-center w-full gap-4">
    <hr class="border-b border-solid border-gray-500 w-1/3" />
    <div class="text-gray-500">or</div>
    <hr class="border-b border-gray-500 w-1/3" />
  </div>
  <input type="text" class="w-4/5" placeholder="User ID" />
  <input type="text" class="w-4/5" placeholder="Password" />
  <button
    class="text-blue-400 bg-blue-700 bg-opacity-30 hover:bg-opacity-40 hover:bg-blue-700 w-4/5"
    ><Upload size="1.5em" /> Import Existing Wallet</button
  >
  <div class="text-sm text-gray-500">&COPY; 2022 Discharge</div>
</div>
