/**
 * The app's own vocabulary. GitHub's snake_case payloads are mapped into these
 * at the API boundary and never travel further inward.
 */
export type RepoIdentity = {
  id: number;
  /** "owner/name" - the natural key for tracking and for query keys. */
  fullName: string;
  owner: string;
  name: string;
  htmlUrl: string;
};

export type RepoSummary = RepoIdentity & {
  description: string | null;
  language: string | null;
  stars: number;
};

export type RepoStats = {
  fullName: string;
  stars: number;
  openIssues: number;
  /**
   * Last push to any branch; see the README for why this stands in for the last
   * commit. `null` for a repository that has never been pushed to.
   */
  lastCommitAt: Date | null;
};
