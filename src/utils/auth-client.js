const validateEmail = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

const validatePhone = (phone) => {
  const pattern = /^(?:\+98|0)?9\d{9}$/;
  return pattern.test(phone);
};
export const normalizePhone = (phone) => {
  let p = phone.trim();
  if (p.startsWith("+98")) p = "0" + p.slice(3);
  if (p.startsWith("98")) p = "0" + p.slice(2);
  return p;
};

const validatePassword = (password) => {
  const pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$/;
  return pattern.test(password);
};

export { validateEmail, validatePhone, validatePassword };
