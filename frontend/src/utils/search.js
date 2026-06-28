import Fuse from 'fuse.js';

/**
 * Perform fuzzy searching on task objects.
 * @param {Array} tasks - List of task objects
 * @param {string} query - The search query string
 * @returns {Array} - Filtered tasks matching query
 */
export const fuzzySearchTasks = (tasks, query) => {
  if (!query || !query.trim()) return tasks;

  const fuse = new Fuse(tasks, {
    keys: ['title', 'description'],
    threshold: 0.3, // Match tolerance (0 = perfect match, 1 = matches anything)
    ignoreLocation: true
  });

  return fuse.search(query).map((result) => result.item);
};
