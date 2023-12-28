export const ensureEnvVars = (envVars: string[]) => {
  const errors: Error[] = []
  envVars.forEach((k) => {
    if (process.env[k] === undefined) {
      errors.push(new Error(`environment variable ${k} not set`))
    }
  })
  return errors
}
