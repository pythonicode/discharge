export const fileName = (path: string) => {
  console.log(path)
  console.log(path.split('/'))
  return path.split('\\').pop()
}

export const fileExtension = (path: string) => {
  return path.split('.').pop()
}
