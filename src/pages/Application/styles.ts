import styled from 'styled-components'

export const DirectoryButton = styled.button`
  padding: 0.5rem 1rem;
  color: #999999;
  background-color: #121212;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  outline: 1px solid gray;
  border: none;
  cursor: pointer;
  transition: all 300ms;
  &:hover {
    outline-color: white;
  }
`

export const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: #999999;
  background-color: #121212;
  text-align: center;
  width: 100%;
  max-width: 80vw;
  white-space: nowrap;
  overflow: hidden;
  outline: 1px solid gray;
  border: none;
  cursor: pointer;
  transition: all 300ms;
  font-size: 12px;
  font-family: 'Roboto Mono', monospace;
  &:hover {
    outline-color: white;
  }
`
