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
