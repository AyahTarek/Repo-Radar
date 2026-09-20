export default {
  // oxlint reads .oxlintrc.json regardless of which files are passed on the CLI.
  '*.{js,jsx,ts,tsx}': ['oxlint'],
  // tsc's project references need the whole program, so a partial file list
  // can't be checked in isolation - run the full typecheck once instead.
  '*.{ts,tsx}': () => 'pnpm -w typecheck',
};
