import type { Plugin } from '@opencode-ai/plugin';

export const WorkflowGuardPlugin: Plugin = async ({ $ }) => {
  let hasFileChanges = false;
  let taskCount = 0;
  let independentTaskCount = 0;

  return {
    event: async ({ event }) => {
      const eventType = event.type;

      if (eventType === 'file.edited') {
        hasFileChanges = true;
      }

      if (eventType === 'todo.updated') {
        const props = event.properties as {
          todos?: Array<{ status?: string }>;
        };
        const todos = props?.todos;
        if (Array.isArray(todos)) {
          taskCount = todos.length;
          const completedOrInProgress = todos.filter(
            (t) => t.status === 'completed' || t.status === 'in_progress',
          );
          independentTaskCount = completedOrInProgress.length;
        }
      }

      if (eventType === 'session.idle') {
        if (!hasFileChanges) return;

        try {
          const diff = await $`git diff --stat`.quiet().nothrow();
          const changedFiles = String(diff.stdout || '').trim();

          if (!changedFiles) return;

          const fileCount = changedFiles.split('\n').filter(Boolean).length;

          const suggestions: string[] = [];

          if (fileCount >= 3) {
            suggestions.push(
              'Consider invoking `requesting-code-review` skill before claiming done.',
            );
          }

          if (taskCount >= 3 && independentTaskCount >= 2) {
            suggestions.push(
              'Multiple independent tasks detected. Consider using `parallel-execution` skill with git worktrees for faster execution.',
            );
          }

          if (suggestions.length > 0) {
            console.log('\n[workflow-guard] Suggestions:');
            suggestions.forEach((s) => console.log(`  - ${s}`));
            console.log('');
          }
        } catch {
          // git not available or not a repo — pass through
        }
      }
    },
  };
};
