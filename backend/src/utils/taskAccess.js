const normalizeId = (value) => value?.toString();

const getTaskParticipantIds = (task) => {
  const ids = [task.owner, ...(task.assignees || [])]
    .map(normalizeId)
    .filter(Boolean);

  return [...new Set(ids)];
};

const canAccessTask = (task, user) => {
  if (user?.role === 'admin') {
    return true;
  }

  return getTaskParticipantIds(task).includes(normalizeId(user?.id));
};

module.exports = {
  canAccessTask,
  getTaskParticipantIds
};
