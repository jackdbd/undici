import Joi from 'joi'

/**
 * @public
 */
export interface Options {
  envVars?: string[]
}

export const defaultOptions: Required<Options> = {
  envVars: ['ELEVENTY_ENV', 'NODE_ENV']
}

// TODO: what is the maximum length of an environment variable NAME?
// https://devblogs.microsoft.com/oldnewthing/20100203-00/?p=15083
// https://stackoverflow.com/questions/1078031/what-is-the-maximum-size-of-a-linux-environment-variable-value
const envVarName = Joi.string().min(1)

const envVarNames = Joi.array()
  .items(envVarName)
  .has('ELEVENTY_ENV')
  .has('NODE_ENV')
  .description(
    'The environment variables you want to ensure are set when building your Eleventy site'
  )

export const pluginOptions = Joi.object()
  .keys({
    envVars: envVarNames.default(defaultOptions.envVars)
  })
  .default(defaultOptions)
