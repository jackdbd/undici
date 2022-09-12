export const throwIfInvokedFromMonorepoRoot = (pwd) => {
  const { name } = require(`${pwd}/package.json`)
  if (name === 'root') {
    throw new Error(
      chalk.red(
        `you invoked this script from ${pwd}. This script should be invoked from a package root instead.`
      )
    )
  }
}

export const throwIfNotInvokedFromMonorepoRoot = (pwd) => {
  const { name } = require(`${pwd}/package.json`)
  if (name !== 'root') {
    throw new Error(
      chalk.red(
        `you invoked this script from ${pwd}. This script should be invoked from the monorepo root instead.`
      )
    )
  }
}

export const unscopedPackageName = async (pwd) => {
  const { name } = require(`${pwd}/package.json`)
  const { stdout: unscoped_name } =
    await $`echo ${name} | sed 's/@jackdbd\\///' | tr -d '\n'`
  return unscoped_name
}
