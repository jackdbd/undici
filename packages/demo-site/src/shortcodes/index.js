/**
 * 11ty shortcodes
 * https://www.11ty.dev/docs/shortcodes/
 */

const copyright = (name) => {
  const startYear = 2020
  const stopYear = new Date().toISOString().slice(0, 4)
  return `Copyright © ${startYear} – ${stopYear} ${name} – All rights reserved`
}

module.exports = {
  copyright
}
