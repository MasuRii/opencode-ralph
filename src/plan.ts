/**
 * Plan file parser for opencode-ralph
 */

export type PlanProgress = {
  done: number;
  total: number;
};

/**
 * Parse a plan file and count completed/total tasks.
 * Tasks are identified by markdown checkboxes: `- [x]` (done) and `- [ ]` (not done)
 * @param path - Path to the plan file
 * @returns Object with done and total counts
 */
export async function parsePlan(path: string): Promise<PlanProgress> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return { done: 0, total: 0 };
  }

  const content = await file.text();

  // Count completed tasks: - [x] (case insensitive)
  const doneMatches = content.match(/- \[x\]/gi);
  const done = doneMatches ? doneMatches.length : 0;

  // Count incomplete tasks: - [ ]
  const notDoneMatches = content.match(/- \[ \]/g);
  const notDone = notDoneMatches ? notDoneMatches.length : 0;

  return {
    done,
    total: done + notDone,
  };
}
