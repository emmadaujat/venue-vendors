// validation helpers for sign in and sign up forms

// checks if the email looks right
export function isValidEmail(email: string) {
  if (!email) return "Email Field is required";

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) return "Incorrect email format";
  return null;
}

// checks if the password meets requirements
// TODO:
// Add a complex password validator so that each password should contain
// at least 1 upper case letter,
// 1 lower case letter,
// and 1 special character,
// and be at least 6 digits
export function isValidPassword(password: string) {
  if (!password) return "Password Field is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Must contain an uppercase letter";
  if (!/[^a-zA-Z0-9]/.test(password)) return "Must contain a special character";
  if (!/\d/.test(password)) return "Must contain a number";
  if (!/[a-z]/.test(password)) return "Must contain a lowercase letter";

  return null;
}

// checks if confirm password matches
export function isValidConfirmPassword(password: string, confirmPassword: string) {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match, please try again";
  return null;
}

export function isValidPhoneNumber(phoneNumber: string) {
  if (!phoneNumber) return "Phone Number is required";
  if (phoneNumber.length != 10) return "Phone Number is invalid";
  if (!/^04/.test(phoneNumber)) return "Phone Number is invalid";
  return null;
}
