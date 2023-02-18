
export const PackageModel = {
  name: '',
  description: '',
  author: '',
  url: '',
  arch: '',
  platform: '',
  restart_required: false,
  last_updated: '',
  created_at: '',
  install_location: '',
  files: [{ name: '', relativePath: '', sha: '' }],
  scripts: {
    pre_inst: '',
    post_inst: ''
  }
}
