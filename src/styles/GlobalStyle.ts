import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    width: 100vw;
    height: 100vh;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    text-align: center;
    gap: 2;
    overflow: hidden;
  }

  h1 {
    font-size: 3rem;
    font-weight: bold;
  }

  p {
    color: #999999
  }

  .page {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .v-center {
    justify-content: center;
  }

  .flex-col {
    display: flex;
    flex-direction: column;
  }

  .flex-row {
    display: flex;
    flex-direction: row;
  }
`
