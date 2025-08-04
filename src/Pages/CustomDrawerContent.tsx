// components/CustomDrawer.js
import { Drawer } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const CustomDrawer = () => {
  const navigation = useNavigation();

  return (
    <Drawer.Section title="Menu">
      <Drawer.Item
        icon="file-document"
        label="Withdrawal Report"
        // onPress={() => navigation.navigate('WithdrawalReport')}
      />
    
    </Drawer.Section>
  );
};

export default CustomDrawer;