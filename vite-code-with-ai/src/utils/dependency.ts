//file: created-app/app/utils/dependency.ts
export const findDependenciesInFiles = (files: { path: string; code: string }[]) => {
  const dependencies: { [key: string]: string } = {};

  files.forEach((file) => {
    const dependenciesRegex = /\/\/dependencies: (.*)/g;
    const matches = file.code.match(dependenciesRegex);

    if (matches) {
      matches.forEach((match) => {
        const dependency = match.replace("//dependencies: ", "");
        dependencies[dependency] = "latest";
      });
    }
  });

  return dependencies;
};