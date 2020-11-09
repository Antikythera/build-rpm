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
    const builtRpmFileName = await runRpmbuild(
      buildRpmArgs(targetSpecFile, inputVariables)
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

function buildRpmArgs(
  specFile: string,
  variables: VariableKeyPair[]
): string[] {
  const cmd = []

  for (const varPair of variables) {
    cmd.push('-D', `"${varPair.name} ${varPair.value}"`)
  }
  cmd.push(specFile)

  return cmd
}

async function runRpmbuild(args: string[]): Promise<string> {
  const targetArgs = ['-bb'].concat(args)
  if ((await exec('rpmbuild', targetArgs)) === 0) {
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
