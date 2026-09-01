// Sentinel token value that marks a session as a local Guest Mode session
// rather than a real JWT issued by the backend. AuthContext stores this in
// place of a real token; axios.js checks for it to decide whether a request
// should be routed to the guest adapter (local storage) instead of the
// network. Kept in its own tiny module so both sides can import it without
// creating a circular dependency between axios.js and AuthContext.jsx.
export const GUEST_TOKEN = 'GUEST_MODE';

export const isGuestToken = (token) => token === GUEST_TOKEN;

export const GUEST_USER_ID = 'guest';

export const createGuestUser = (name = 'Guest') => ({
  id: GUEST_USER_ID,
  name,
  email: null,
  role: 'user',
  isGuest: true,
  createdAt: new Date().toISOString()
});
