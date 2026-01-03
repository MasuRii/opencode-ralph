/**
 * Git utilities for opencode-ralph
 */

/**
 * Get the current HEAD commit hash
 */
export async function getHeadHash(): Promise<string> {
  const proc = Bun.spawn(["git", "rev-parse", "HEAD"], {
    stdout: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  await proc.exited;

  return stdout.trim();
}

/**
 * Get the number of commits since a given hash
 */
export async function getCommitsSince(hash: string): Promise<number> {
  const proc = Bun.spawn(["git", "rev-list", "--count", `${hash}..HEAD`], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  await proc.exited;

  const count = parseInt(stdout.trim(), 10);
  return isNaN(count) ? 0 : count;
}
