import Toast from 'react-native-toast-message';

const showNotification = (
  message: string,
  type: 'error' | 'success' | 'info',
) => {
  console.log(message,type)
  return Toast.show({
    type: type,
    text1: message,
  });
};


export {showNotification}