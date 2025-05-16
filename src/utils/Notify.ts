import Toast from 'react-native-toast-message';

const showNotification = (
  message: string,
  type: 'error' | 'success' | 'info',
) => {
  return Toast.show({
    type: type,
    text1: message,
  });
};


export {showNotification}