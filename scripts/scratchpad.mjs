import { calculate, compare } from 'specificity'

const main = async () => {
  const selectors = [
    '.some-class',
    'div:hover',
    'div',
    '#some-id',
    'ul#nav li.active a'
  ]

  console.log(`selectors NOT sorted`)
  selectors.forEach((selector) => {
    console.log(`calculate('${selector}')`, calculate(selector))
  })

  console.log(`\nselectors sorted according to their specificity`)
  console.log(selectors.map(calculate).sort(compare))
  console.log(
    selectors
      .map((selector) => {
        const specificity = calculate(selector)
        return { selector, specificity }
      })
      .sort((a, b) => {
        return compare(a.specificity, b.specificity)
      })
  )
}

main()
