// src/utils/validation.js
export const usernameRegex = /^[a-zA-Z0-9_.-]{3,20}$/;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateUsername = (username) => usernameRegex.test(username.trim());
export const validateEmail = (email) => emailRegex.test(email);
export const validatePassword = (password) => passwordRegex.test(password);
