import {execSync} from 'child_process';
import {writeFileSync} from 'fs';

interface Platforms {
  supported: string[];
  available: string[];
}

function run(cmd: string): string {
  return execSync(cmd, {stdio: 'pipe'}).toString();
}

const image = process.env.IMAGE || 'docker.io/tonistiigi/binfmt:latest';
const platforms = process.env.PLATFORMS || 'all';
const outputFile = process.env.output_file;

console.log('Docker info');
console.log(run('docker version'));
console.log(run('docker info'));

console.log('Pulling binfmt Docker image');
console.log(run(`docker pull ${image}`));

console.log('Image info');
console.log(run(`docker image inspect ${image}`));

console.log('Binfmt version');
console.log(run(`docker run --rm --privileged ${image} --version`));

console.log('Installing QEMU static binaries');
run(`docker run --rm --privileged ${image} --install ${platforms}`);

console.log('Extracting available platforms');
const res = run(`docker run --rm --privileged ${image}`);
const platformsObj = JSON.parse(res.trim()) as Platforms;
const available = platformsObj.available.join(',');
console.log(`Available platforms: ${available}`);
if (outputFile) {
  writeFileSync(outputFile, JSON.stringify({name: 'platforms', value: available}) + '\n');
}

