import * as core from '@actions/core'
import {exec} from '@actions/exec'
import * as fs from 'fs'
import * as path from 'path'
import {
  copyFileToDir,
  parseInputVariables,
  parseInputSources,
  validateInputSpecFile,
  VariableKeyPair
} from './util'

const rpmBuildTmp = `${process.env.HOME}/rpmbuild`
const rpmSourcesTmp = `${rpmBuildTmp}/SOURCES`
const targetRpmBuildTmp = `${rpmBuildTmp}/RPMS/x86_64`
const outputRpmDir = `${process.env.GITHUB_WORKSPACE}/RPMS`

async function run(): Promise<void> {
  try {
    const inputSpecFile = validateInputSpecFile(core.getInput('spec_file'))
    const targetSpecFile = `${rpmBuildTmp}/SPECS/${path.basename(
      inputSpecFile
    )}`
    const inputVariables = parseInputVariables(core.getInput('variables'))
    const inputSources = parseInputSources(core.getInput('sources'))

    // Init rpmbuild dir tree
    await exec('rpmdev-setuptree')

    // Copy spec file to dir tree
    fs.copyFileSync(inputSpecFile, targetSpecFile)

    // Copy sources to dir tree
    copyRpmSources(inputSources)

    // Create the action output RPM dir
    fs.mkdirSync(outputRpmDir, {recursive: true})

    // Run rpmbuild and save the rpm file name
    const builtRpmFileName = await runRpmbuildCmd(
      buildRpmbuildCmd(targetSpecFile, inputVariables)
    )

    // Copy the built RPM to the output dir
    fs.copyFileSync(
      `${targetRpmBuildTmp}/${builtRpmFileName}`,
      `${outputRpmDir}/${builtRpmFileName}`
    )

    core.setOutput('rpm_package_name', `${builtRpmFileName}`)
    core.setOutput('rpm_package_path', `${outputRpmDir}/${builtRpmFileName}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

function copyRpmSources(sources: string[]): void {
  for (const source of sources) {
    copyFileToDir(source, rpmSourcesTmp)
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
  const cmd = `rpmbuild -bb${rpmVars} ${specFile}`
  core.info(cmd)
  return cmd
}

async function runRpmbuildCmd(cmd: string): Promise<string> {
  if ((await exec(cmd)) === 0) {
    const rpmFile = fs.readdirSync(targetRpmBuildTmp)
    if (rpmFile.length === 0) {
      throw new Error(`couldn't find the rpm file at ${targetRpmBuildTmp}`)
    }
    return rpmFile[0]
  } else {
    throw new Error('rpmbuild command failed')
  }
}

run()
