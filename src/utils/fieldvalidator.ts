import {showNotification} from './Notify';

export function validateEmail(email: any) {
  console.log(email);
  if (!email) {
    showNotification('Email is Required', 'error');
  }
  if (email) {
    const reg =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const isValid = reg.test(email);
    console.log(`Email "${email}" is valid:`, isValid);
    if (!isValid) {
      showNotification('Inavlid Email', 'error');
      return isValid;
    }
    return isValid;
  }

  // RFC 5322 compliant regex (simplified version)
}

export function ValidatePassword(password: any) {
  if (!password) {
    showNotification('Password is Required', 'error');
    return false;
  }
  if (password.length <  8) {
    showNotification('Password length Must be 6 digit', 'error');
    return false;
  }
  return true
}
