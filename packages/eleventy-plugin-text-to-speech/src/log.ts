import { ERR_PREFIX } from './constants.js'

export const logError = (err: Error) => {
  console.error(`${ERR_PREFIX} error`)
  console.error(err)
}

export const logErrors = (errors: Error[], outputPath: string) => {
  if (errors.length > 0) {
    console.error(
      `${ERR_PREFIX} encountered ${errors.length} errors while transforming ${outputPath}`
    )
    errors.forEach((err, i) => {
      console.log(`${i + 1}. ${err.message}`)
    })
  }
}
