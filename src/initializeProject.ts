export default function initializeProject({ publisherSolution }: Options) {
  console.log(`creating a new project for publisher ${publisherSolution}`);
}

interface Options {
  publisherSolution: string;
}
