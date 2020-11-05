import * as fs from 'fs'
import * as path from 'path'

export type VariableKeyPair = {
  name: string
  value: string
}

export function parseInputVariables(variables: string): VariableKeyPair[] {
  if (variables !== '') {
    const lineRegex = /^[a-zA-Z0-9_]+=[a-zA-Z0-9_.\-]+$/m
    // "foo=bar\nboo=foo" -> ["foo=bar", "boo=foo"] -> [["foo", "bar"], ["boo", "foo"]]
    const validateLine: (l: string) => string = (line: string) => {
      if (!lineRegex.test(line)) {
        throw new Error(
          `Expected the line input to be in "<name>=<value>" form, got ${line} instead`
        )
      }

      return line
    }

    return variables
      .split('\n')
      .map(validateLine)
      .map(varPair => varPair.split('='))
      .map(vars => ({name: vars[0], value: vars[1]}))
  }

  return []
}

export function validateInputSpecFile(specFile: string): string {
  const fullPath = path.resolve(specFile)
  if (fs.existsSync(fullPath)) {
    return fullPath
  } else {
    throw new Error(`RPM Spec file doesn't exist in: ${fullPath}`)
  }
}
