import fs from 'fs';
import path from 'path';
import solc from 'solc';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function findImports(importPath) {
  let fullPath;
  if (importPath.startsWith('@openzeppelin/')) {
    fullPath = path.resolve(rootDir, 'node_modules', importPath);
  } else if (importPath.startsWith('contracts/')) {
    fullPath = path.resolve(rootDir, importPath);
  } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
    fullPath = path.resolve(rootDir, 'contracts', importPath);
  } else {
    fullPath = path.resolve(rootDir, 'contracts', importPath);
    if (!fs.existsSync(fullPath)) {
      fullPath = path.resolve(rootDir, 'node_modules', importPath);
    }
  }

  try {
    const contents = fs.readFileSync(fullPath, 'utf8');
    return { contents };
  } catch (err) {
    return { error: `File not found: ${fullPath}` };
  }
}

async function compile() {
  console.log('Compiling Smart Contracts for PISO Chain...');

  const tokenRegistrySource = fs.readFileSync(path.resolve(rootDir, 'contracts/TokenRegistry.sol'), 'utf8');
  const pisoStablecoinSource = fs.readFileSync(path.resolve(rootDir, 'contracts/PisoStablecoin.sol'), 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'contracts/TokenRegistry.sol': { content: tokenRegistrySource },
      'contracts/PisoStablecoin.sol': { content: pisoStablecoinSource },
    },
    settings: {
      evmVersion: 'paris',
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  if (output.errors) {
    const fatal = output.errors.filter((e) => e.severity === 'error');
    if (fatal.length > 0) {
      console.error('Compilation failed with errors:');
      output.errors.forEach((e) => console.error(e.formattedMessage));
      process.exit(1);
    }
  }

  const artifactsDir = path.resolve(rootDir, 'contracts/artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  // Save TokenRegistry artifact
  const registryContract = output.contracts['contracts/TokenRegistry.sol']['TokenRegistry'];
  fs.writeFileSync(
    path.resolve(artifactsDir, 'TokenRegistry.json'),
    JSON.stringify(
      {
        contractName: 'TokenRegistry',
        abi: registryContract.abi,
        bytecode: `0x${registryContract.evm.bytecode.object}`,
      },
      null,
      2
    )
  );

  // Save PisoStablecoin artifact
  const stablecoinContract = output.contracts['contracts/PisoStablecoin.sol']['PisoStablecoin'];
  fs.writeFileSync(
    path.resolve(artifactsDir, 'PisoStablecoin.json'),
    JSON.stringify(
      {
        contractName: 'PisoStablecoin',
        abi: stablecoinContract.abi,
        bytecode: `0x${stablecoinContract.evm.bytecode.object}`,
      },
      null,
      2
    )
  );

  console.log('[SUCCESS] Contracts compiled successfully!');
  console.log('Artifacts written to: contracts/artifacts/');
}

compile().catch(console.error);
