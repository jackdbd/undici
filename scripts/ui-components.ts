import { link, list } from '@thi.ng/transclude'
export interface CalloutConfig {
  // https://github.com/ikatyang/emoji-cheat-sheet
  emoji: string
  title: string
  message: string
}

export const callout = (cfg: CalloutConfig) => {
  const paragraphs = cfg.message.split('\n\n')
  const body = paragraphs.map((p) => `> ${p}`).join('\n>\n')

  const lines = [`> ${cfg.emoji} **${cfg.title}**`, '\n', `>`, '\n', body]
  return lines.join('')
}

interface Override {
  [peer: string]: string
}

interface Overrides {
  [pkg: string]: Override
}

export const overridesCallout = (overrides: Overrides) => {
  const keys = Object.keys(overrides)
  const over = keys.length === 1 ? `override` : `overrides`
  const pkgs = keys.length === 1 ? `this package` : `these packages`
  // https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides
  return callout({
    emoji: ':warning:',
    title: `Overrides`,
    message: `This project defines ${keys.length} ${over} for ${pkgs}:\n\n${list(keys)}\n\nRefer to the ${link('npm documentation', 'https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides')} to know more about overrides.`
  })
}
