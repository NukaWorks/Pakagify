export const logoutCmd = (configProvider) => {
  configProvider.remove('token')
  configProvider.save()
  console.log('Successfully logged out.')
}
