import * as path from 'path'
import {validateInputSpecFile, parseInputVariables} from '../src/util'

describe('parseInputVariables', () => {
  test('returns an variables array for valid input', () => {
    const input =
      'foo=bar\nversion=1.0.0\n_underscore=10\nsuffix_=value\n_source=project-v0.1.15.tar.gz'
    const expectedOutput = [
      {name: 'foo', value: 'bar'},
      {name: 'version', value: '1.0.0'},
      {name: '_underscore', value: '10'},
      {name: 'suffix_', value: 'value'},
      {name: '_source', value: 'project-v0.1.15.tar.gz'}
    ]
    const output = parseInputVariables(input)
    expect(output).toEqual(expectedOutput)
  })

  test('accepts tilde in variables input', () => {
    const input = '_version=1.0.1~rc1'
    const expectedOutput = [{name: '_version', value: '1.0.1~rc1'}]

    const output = parseInputVariables(input)
    expect(output).toEqual(expectedOutput)
  })

  test('throws an error on invalid input - no equal sign', () => {
    const input = 'foo=bar\nleftright'
    expect(() => parseInputVariables(input)).toThrowError()
  })

  test('throws an error on invalid input - equal sign on left', () => {
    const input = 'foo=bar\n=left'
    expect(() => parseInputVariables(input)).toThrowError()
  })

  test('throws an error on invalid input - equal sign on right', () => {
    const input = 'foo=bar\nright='
    expect(() => parseInputVariables(input)).toThrowError()
  })
})

describe('validateInputSpecFile', () => {
  test('returns a full path of the valid spec file path', () => {
    const pwd = path.resolve()
    const testRpmSpecFile = 'rpm_assets/hello_world.spec'
    const expectedOutput = path.join(pwd, testRpmSpecFile)
    const output = validateInputSpecFile(testRpmSpecFile)
    expect(output).toEqual(expectedOutput)
  })

  test("throws if file doesn't exist", () => {
    const wrongTestRpmSpecFile = 'rpm_assets/phantom.spec'
    expect(() => validateInputSpecFile(wrongTestRpmSpecFile)).toThrowError()
  })
})
