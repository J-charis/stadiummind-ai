import { create } from 'zustand';

// Client-side task-completion state — implementation §6 "Task Completion".
// Stands in for a Postgres UPDATE on `tasks.status` (Blueprint §7) until
// Supabase writes are wired in; TanStack Query still owns the read side.

interface VolunteerTaskState {
  completedTaskIds: Set<string>;
  completeTask: (taskId: string) => void;
}

export const useVolunteerTaskStore = create<VolunteerTaskState>((set) => ({
  completedTaskIds: new Set(),
  completeTask: (taskId) =>
    set((state) => {
      const next = new Set(state.completedTaskIds);
      next.add(taskId);
      return { completedTaskIds: next };
    }),
}));
