#!/usr/bin/env node

import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

function getCodexHome() {
  if (process.env.CODEX_HOME && process.env.CODEX_HOME.trim().length > 0) {
    return process.env.CODEX_HOME;
  }
  return path.join(os.homedir(), '.codex');
}

function listSkills(listScriptPath, extraArgs = []) {
  const output = execFileSync('python3', [listScriptPath, ...extraArgs, '--format', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  return JSON.parse(output);
}

function listLocalSkills(skillsRoot) {
  if (!fs.existsSync(skillsRoot)) {
    return [];
  }

  return fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function main() {
  const codexHome = getCodexHome();
  const skillsRoot = path.join(codexHome, 'skills');
  const installerRoot = path.join(skillsRoot, '.system', 'skill-installer');
  const listScriptPath = path.join(installerRoot, 'scripts', 'list-skills.py');
  const outputPath = path.resolve(process.cwd(), 'public', 'codex-skills.json');

  if (!fs.existsSync(listScriptPath)) {
    throw new Error(`skill-installer list script not found at ${listScriptPath}`);
  }

  const curated = listSkills(listScriptPath);

  let experimental = {
    available: false,
    error: ''
  };

  try {
    const experimentalSkills = listSkills(listScriptPath, ['--path', 'skills/.experimental']);
    experimental = {
      available: true,
      total: experimentalSkills.length,
      installedCount: experimentalSkills.filter((skill) => Boolean(skill.installed)).length,
      skills: experimentalSkills
    };
  } catch (error) {
    experimental.error = error instanceof Error ? error.message : String(error);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    codexHome,
    source: {
      repo: 'openai/skills',
      curatedPath: 'skills/.curated',
      experimentalPath: 'skills/.experimental'
    },
    curated: {
      total: curated.length,
      installedCount: curated.filter((skill) => Boolean(skill.installed)).length,
      skills: curated
    },
    experimental,
    locallyInstalled: listLocalSkills(skillsRoot)
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`Wrote ${outputPath}`);
  console.log(`Curated skills installed: ${payload.curated.installedCount}/${payload.curated.total}`);
  if (!payload.experimental.available) {
    console.log('Experimental skills source unavailable; see codex-skills.json for the error.');
  }
}

main();
