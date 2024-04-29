import { defineConfig } from 'taze'

export default defineConfig({
  exclude: [],
  force: true,
  install: true,
  // interactive: true,
  interactive: !process.env.CI && process.stdout.isTTY,
  packageMode: {
    // a regex starts and ends with '/'
    '/@types\\//': 'latest',
    taze: 'latest'
  },
  recursive: true,
  write: true
})
