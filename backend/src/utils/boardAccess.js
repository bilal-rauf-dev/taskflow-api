const ROLE_RANK = { viewer: 1, editor: 2, owner: 3 };

const normalizeId = (value) => value?.toString();

const getBoardMemberRole = (board, user) => {
  const userId = normalizeId(user?.id);
  const membership = (board.members || []).find(
    (member) => normalizeId(member.user?._id || member.user) === userId
  );

  return membership?.role || null;
};

// Admins mirror the canAccessTask bypass used elsewhere in the app.
const canAccessBoard = (board, user, minRole = 'viewer') => {
  if (user?.role === 'admin') {
    return true;
  }

  const role = getBoardMemberRole(board, user);
  if (!role) {
    return false;
  }

  return ROLE_RANK[role] >= ROLE_RANK[minRole];
};

const getBoardMemberIds = (board) => {
  const ids = (board.members || [])
    .map((member) => normalizeId(member.user?._id || member.user))
    .filter(Boolean);

  return [...new Set(ids)];
};

module.exports = {
  ROLE_RANK,
  canAccessBoard,
  getBoardMemberRole,
  getBoardMemberIds
};
