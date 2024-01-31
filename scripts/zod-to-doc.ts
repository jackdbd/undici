import fs from 'node:fs'
import path from 'node:path'
import makeDebug from 'debug'
import yargs from 'yargs/yargs'
import { markdownTableFromZodSchema } from '../packages/eleventy-test-utils/src/utils.js'

const BIN = 'zod-to-doc'

const debug = makeDebug(`script:${BIN}`)
// names to consider:
// doc-zod-table, schema-to-doc, zod-to-doc, zod-to-table, ztd, ztt

// https://github.com/thi-ng/umbrella/blob/develop/tools/src/readme.ts
// https://github.com/thi-ng/umbrella/blob/develop/tools/bin/readme.mjs
// https://github.com/thi-ng/umbrella/blob/develop/tools/src/readme-examples.ts
// https://github.com/thi-ng/umbrella/tree/develop/tools/src
// https://github.com/thlorenz/doctoc/blob/95715a3a56fe08fb3d74e53f64b54b25756b31fa/lib/transform.js#L167C19-L167C69

// https://github.com/colinhacks/zod/discussions/1953
const main = async () => {
  const argv = await yargs(process.argv.slice(2))
    .usage(
      './$0 - Generated a markdown table from a Zod schema and write it to a file'
    )
    .option('module', {
      alias: 'm',
      demandOption: true,
      describe: 'relative path to a ESM/TS module that exports a Zod schema',
      type: 'string'
    })
    .option('schema', {
      alias: 's',
      demandOption: true,
      describe: 'Zod schema you want to generate a markdown table for',
      type: 'string'
    })
    .option('filepath', {
      alias: 'f',
      default: 'README.md',
      describe: 'File where you want to inject the markdown table',
      type: 'string'
    })
    .option('placeholder', {
      alias: 'p',
      default: `${BIN} (please keep comment here to allow auto update)`,
      describe:
        'Placeholder that identifies where to insert the generated markdown table',
      type: 'string'
    })
    .option('title', {
      alias: 't',
      demandOption: false,
      // default: 'Table from Zod schema',
      describe: 'Title of the generated table',
      type: 'string'
    })
    .option('dry-run', {
      boolean: true,
      describe:
        'If true, print the generated markdown to stdout instead of writing it to the specified file'
    })
    .example(
      '$0 --module src/schemas/foo.ts --schema bar',
      `use the 'bar' zod schema from the 'foo.ts' module to generate a markdown table and update the README.md file`
    )
    .help('info')
    .wrap(80).argv

  const module_filepath = path.join(process.env.PWD!, argv.module)
  const ts_module = await import(module_filepath)
  const schema = ts_module[argv.schema]
  debug(`import { ${argv.schema} } from '${module_filepath}'`)

  let title = ''
  if (argv.title) {
    title = argv.title
  } else {
    title = schema.description
      ? `**Table for ${schema.description}**`
      : `**Table from Zod schema**`
  }

  const table = markdownTableFromZodSchema(schema)
  debug(`table generated from Zod schema`)
  debug(table)

  const doc_filepath = path.join(process.env.PWD!, argv.filepath)

  debug(`read ${doc_filepath}`)
  const str = fs.readFileSync(doc_filepath, 'utf-8')

  const placeholder_begin = `<!-- BEGIN ${argv.placeholder} -->`
  const placeholder_end = `<!-- END ${argv.placeholder} -->`
  debug(`looking for these placeholders in ${doc_filepath} %O`, {
    begin: placeholder_begin,
    end: placeholder_end
  })
  const tip = `<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN ${BIN} TO UPDATE -->`

  const i_begin = str.indexOf(placeholder_begin)
  const i_end = str.indexOf(placeholder_end) + placeholder_end.length

  const before = str.substring(0, i_begin).trimEnd()
  const after = str.substring(i_end).trimStart()

  const splits = [
    before,
    '\n\n',
    placeholder_begin,
    '\n',
    tip,
    '\n\n',
    title,
    '\n\n',
    table,
    '\n',
    placeholder_end,
    '\n\n',
    after
  ]

  const md = splits.join('')

  if (argv['dry-run']) {
    console.log(md)
    debug(`${doc_filepath} not modified because of --dry-run`)
  } else {
    fs.writeFileSync(doc_filepath, md)
    debug(`${doc_filepath} updated`)
  }
}

await main()
