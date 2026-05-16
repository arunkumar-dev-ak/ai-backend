import { Project } from 'ts-morph';
import fs from 'fs';

type FixOperation =
  | {
      type: 'replace_method';
      file: string;
      class: string;
      method: string;
      code: string;
    }
  | {
      type: 'add_method';
      file: string;
      class: string;
      code: string;
    }
  | {
      type: 'add_import';
      file: string;
      module: string;
      namedImports?: string[];
      defaultImport?: string;
    }
  | {
      type: 'create_file';
      file: string;
      content: string;
    };

//
// INPUT
//
// node refactor.ts '[{...}]'
//
const rawOperations = process.argv[2];

if (!rawOperations) {
  console.error('No operations provided');
  process.exit(1);
}

const operations: FixOperation[] = JSON.parse(rawOperations);

//
// PROJECT
//
const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

//
// PROCESS OPERATIONS
//
operations.forEach((operation) => {
  //
  // CREATE FILE
  //
  if (operation.type === 'create_file') {
    fs.writeFileSync(operation.file, operation.content);

    console.log(`Created file: ${operation.file}`);

    return;
  }

  //
  // OPEN SOURCE FILE
  //
  const sourceFile = project.addSourceFileAtPath(operation.file);

  //
  // ADD IMPORT
  //
  if (operation.type === 'add_import') {
    const alreadyExists = sourceFile
      .getImportDeclarations()
      .some((imp) => imp.getModuleSpecifierValue() === operation.module);

    if (!alreadyExists) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: operation.module,
        namedImports: operation.namedImports,
        defaultImport: operation.defaultImport,
      });

      console.log(`Added import in ${operation.file}`);
    }

    sourceFile.saveSync();

    return;
  }

  //
  // FIND CLASS
  //
  const classDec = sourceFile.getClass(operation.class);

  if (!classDec) {
    console.error(`Class ${operation.class} not found`);

    return;
  }

  //
  // REPLACE METHOD
  //
  if (operation.type === 'replace_method') {
    const method = classDec.getMethod(operation.method);

    if (!method) {
      console.error(`Method ${operation.method} not found`);

      return;
    }

    //
    // Replace FULL method
    //
    method.replaceWithText(operation.code);

    console.log(`Updated method ${operation.class}.${operation.method}`);
  }

  //
  // ADD METHOD
  //
  if (operation.type === 'add_method') {
    classDec.addMembers([operation.code]);

    console.log(`Added method to ${operation.class}`);
  }

  //
  // SAVE FILE
  //
  sourceFile.saveSync();
});

console.log('SUCCESS');
