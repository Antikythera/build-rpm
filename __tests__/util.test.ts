import * as path from 'path'
import {validateInputSpecFile, parseInputVariables} from '../src/util'

describe('parseInputVariables', () => {
  test('returns an variables array for valid input', () => {
    const input = 'foo=bar\nleft=right'
    const expectedOutput = [
      {name: 'foo', value: 'bar'},
      {name: 'left', value: 'right'}
    ]
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
    const testRpmSpecFile = './__tests__/test_rpm.spec'
    const expectedOutput = path.join(pwd, testRpmSpecFile)
    const output = validateInputSpecFile(testRpmSpecFile)
    expect(output).toEqual(expectedOutput)
  })

  test("throws if file doesn't exist", () => {
    const wrongTestRpmSpecFile = './__tests__/phantom.spec'
    expect(() => validateInputSpecFile(wrongTestRpmSpecFile)).toThrowError()
  })
})
