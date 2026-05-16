import { Project, SyntaxKind, Node } from 'ts-morph';

const [filePath, methodName] = process.argv.slice(2);

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const sourceFile = project.addSourceFileAtPath(filePath);

const result: any = {
  file: filePath,
  targetMethod: methodName,
  methods: [],
  imports: [],
};

// Track visited methods
const visitedMethods = new Set();

// Recursive Method Resolver
function processMethod(method: any) {
  if (!method) return;

  const methodName = method.getName();

  // Avoid infinite recursion
  if (visitedMethods.has(methodName)) {
    return;
  }

  visitedMethods.add(methodName);

  // Save method code
  result.methods.push({
    methodName,
    code: method.getText(),
  });

  // Find identifiers used
  /* 
  eg:
  this.validateUser(dto)
  CallExpression
  ├── Identifier: this
  ├── Identifier: validateUser
  └── Identifier: dto
  */
  const identifiers = method.getDescendantsOfKind(SyntaxKind.Identifier);

  const usedNames = new Set(identifiers.map((i) => i.getText()));

  // Filter ONLY used imports
  sourceFile.getImportDeclarations().forEach((imp) => {
    // getImportDeclarations - all file imports
    const matchedImports: string[] = [];

    // named imports - single line
    imp.getNamedImports().forEach((named) => {
      const importName = named.getName();

      if (usedNames.has(importName)) {
        matchedImports.push(importName);
      }
    });

    if (matchedImports.length > 0) {
      result.imports.push({
        module: imp.getModuleSpecifierValue(), //path in import
        namedImports: matchedImports, // name in import
      });
    }
  });

  // Find local method calls
  /* 
  eg:
  this.validate()
  repo.save()
  bcrypt.hash()
  */
  const calls = method.getDescendantsOfKind(SyntaxKind.CallExpression);

  calls.forEach((call) => {
    const expression = call.getExpression();

    if (Node.isPropertyAccessExpression(expression)) {
      const calledMethod = expression.getName();

      //
      // Find method in same class
      //
      const parentClass = method.getFirstAncestorByKind(
        SyntaxKind.ClassDeclaration,
      );

      const localMethod = parentClass?.getMethod(calledMethod);

      //
      // Recursive traversal
      //
      if (localMethod) {
        processMethod(localMethod);
      }
    }
  });
}

//
// Start from target method
//
sourceFile.getClasses().forEach((cls) => {
  const method = cls.getMethod(methodName);

  if (method) {
    processMethod(method);
  }
});

console.log(JSON.stringify(result, null, 2));
