const STORAGE_KEY = 'attendance_auth_users';
const CURRENT_USER_KEY = 'attendance_current_user';

export const getUsers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveUsers = (users) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const registerUser = ({ fullName, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('This email is already registered.');
  }

  const newUser = {
    id: Date.now(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
  };

  saveUsers([...users, newUser]);
  return newUser;
};

export const loginUser = ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const user = users.find((item) => item.email === normalizedEmail);

  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.');
  }

  const sessionUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
  return sessionUser;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = () => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};
