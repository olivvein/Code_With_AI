type File = {
  path: string;
  code: string;
};

export const findDependenciesInFiles = (files: File[]) => {
  const dependencies: string[] = [];

  if (!files || files.length === 0) {
    return "{}";
  }

  files.forEach((file) => {
    const dependenciesRegex = /\/\/dependencies: (.*)/g;
    const matches = file.code.match(dependenciesRegex);

    if (matches) {
      matches.forEach((match) => {
        const dependency = match.replace("//dependencies: ", "");
        dependencies.push(dependency);
      });
    }
  });

  const dependenciesObject = dependencies.reduce(
    (acc: { [key: string]: string }, dependency) => {
      acc[dependency] = "latest";
      return acc;
    },
    {}
  );

  return JSON.stringify(dependenciesObject);
};