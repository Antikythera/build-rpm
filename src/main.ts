import * as core from '@actions/core'
import {exec} from '@actions/exec'
import * as fs from 'fs'
import {
  parseInputVariables,
  validateInputSpecFile,
  VariableKeyPair
} from './util'

const rpmbuildTmp = '/github/home/rpmbuild'
const targetRpmbuildTmp = `${rpmbuildTmp}/RPMS/x86_64`
const outputRpmDir = '/github/workspace/RPMS'

async function run(): Promise<void> {
  try {
    const specFile: string = validateInputSpecFile(core.getInput('spec_file'))
    const inputVariables = parseInputVariables(core.getInput('variables'))

    core.debug(`Spec file: ${specFile}`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    core.debug(`Input variables: ${inputVariables}`)

    // Init rpmbuild dir tree
    await exec('rpmdev-setuptree')

    // Copy spec file to dir tree
    fs.copyFileSync(specFile, `${rpmbuildTmp}/SPECS/`)

    // Create the action output RPM dir
    fs.mkdirSync(outputRpmDir, {recursive: true})

    // Run rpmbuild and save the rpm file name
    const builtRpmFileName = await runRpmbuildCmd(
      buildRpmbuildCmd(specFile, inputVariables)
    )

    // Copy the built RPM to the output dir
    fs.copyFileSync(
      `${targetRpmbuildTmp}/${builtRpmFileName}`,
      outputRpmFilePath(builtRpmFileName)
    )

    core.setOutput('rpm_package_path', outputRpmFilePath(builtRpmFileName))
  } catch (error) {
    core.setFailed(error.message)
  }
}

function buildRpmbuildCmd(
  specFile: string,
  variables: VariableKeyPair[]
): string {
  const rpmVars = variables.reduce(
    (acc, varPair) =>
      acc.concat(` --define '${varPair.name} ${varPair.value}'`),
    ''
  )
  return `rpmbuild -bb${rpmVars} ${specFile}`
}

async function runRpmbuildCmd(cmd: string): Promise<string> {
  if ((await exec(cmd)) === 0) {
    const rpmFile = fs.readdirSync(targetRpmbuildTmp)
    if (rpmFile.length === 0) {
      throw new Error("couldn't find the rpm file")
    }
    return rpmFile[0]
  } else {
    throw new Error('rpmbuild command failed')
  }
}

function outputRpmFilePath(fileName: string): string {
  return `${outputRpmDir}/${fileName}`
}

run()
