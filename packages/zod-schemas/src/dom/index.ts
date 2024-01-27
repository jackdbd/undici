import { z } from 'zod'

export const css_selector = z.string().min(1).describe('CSS selector')

export const xpath_expression = z.string().min(1).describe('XPath expression')
