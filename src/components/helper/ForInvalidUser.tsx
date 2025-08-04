import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Button, Dialog, Portal, useTheme} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

interface InValidUserInterface {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onConfirm?: () => void;
  email: string;
}

export default function ForInvalidUser(props: InValidUserInterface) {
  const {visible, setVisible, onConfirm, email} = props;
  const theme = useTheme();
  const navigation = useNavigation();

  const hideDialog = () => setVisible(false);
  const handleConfirm = () => {
    hideDialog();
    // onConfirm?.();
    gotoCreateAccount();
  };

  const gotoCreateAccount = () => {
    navigation.navigate('InvalidUserRegForm', {
      email: email, // or your dynamic value         // or your dynamic value
    });
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialog}>
        <Dialog.Title style={styles.title}>Account Not Eligible</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.message}>
            You are not eligible to use our platform.
          </Text>
          <Text style={styles.question}>
            Would you like to create a new account with the same details?
          </Text>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          <Button
            onPress={hideDialog}
            textColor={theme.colors.error}
            style={styles.button}>
            Cancel
          </Button>
          <Button
            onPress={handleConfirm}
            mode="contained"
            style={styles.button}>
            Create New Account
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 8,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  question: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  actions: {
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    minWidth: 120,
    borderRadius: 4,
  },
});
