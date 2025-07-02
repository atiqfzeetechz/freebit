import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  Appbar,
  Divider,
  IconButton,
  Menu,
  Modal,
  Portal,
  TextInput,
  Button,
} from 'react-native-paper';
import {wp, hp} from '../helper/hpwp';
import {useSidebar} from '../context/SidebarContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import useAxios from '../hooks/useAxios';
import NotFound from '../components/helper/NotFound';
import Toast from 'react-native-toast-message';
import {showNotification} from '../utils/Notify';

// Mock data - replace with your actual data
const withdrawalAddresses = [
  {
    id: '1',
    type: 'upi',
    nickname: 'Primary UPI',
    details: {upi_id: 'user@upi', provider: 'Google Pay'},
    is_default: true,
    is_verified: true,
  },
  {
    id: '2',
    type: 'bank_account',
    nickname: 'HDFC Savings',
    details: {
      account_holder_name: 'John Doe',
      account_number: '*******7890',
      bank_name: 'HDFC Bank',
      ifsc_code: 'HDFC0001234',
    },
    is_default: false,
    is_verified: true,
  },
  {
    id: '3',
    type: 'crypto_wallet',
    nickname: 'ETH Wallet',
    details: {
      wallet_address: '0x742...f44e',
      network: 'Ethereum',
    },
    is_default: false,
    is_verified: false,
  },
];

interface UPI {
  nickname: string;
  details: {
    upi_id: string;
    provider?: string; // Optional field
  };
}

interface BANKDETAILS {
  nickname: string;
  details: {
    account_holder_name: string;
    account_number: string;
    bank_name: string;
    ifsc_code: string;
    account_type: string;
  };
}

interface CRYPTOINPUT {
  nickname: string;
  details: {
    wallet_address: string;
    network: string;
  };
}

const bankdetails = {
  nickname: '',
  details: {
    account_holder_name: '',
    account_number: '',
    bank_name: '',
    ifsc_code: '',
    account_type: '',
  },
};
const crypto = {
  nickname: '',
  details: {
    wallet_address: '',
    network: '',
  },
};
const upid = {
  nickname: '',
  details: {
    upi_id: '',
    provider: '',
  },
};
export default function ChangeWithDrawlAddress() {
  const {openSidebar} = useSidebar();

  const {fetchData} = useAxios();

  const [visible, setVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addressType, setAddressType] = useState('crypto_wallet');
  const [menuVisible, setMenuVisible] = useState(false);
  const [upiInput, setUpiInput] = useState<UPI>(upid);
  const [bankInput, setBankInput] = useState<BANKDETAILS>(bankdetails);
  const [cryptoInput, setCryptoInput] = useState<CRYPTOINPUT>(crypto);

  const [withdrawalAddresses, setwithdrawalAddresses] = useState([]);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const getAddresses = async () => {
    const res = await fetchData({
      url: '/withdrawAddress/getAddress',
    });
    if (res?.status == 200) {
      setwithdrawalAddresses(res.data.data);
    }
    console.log(res);
  };

  useEffect(() => {
    getAddresses();
  }, []);

  const handleSetDefault = async (id: string) => {
    console.log(id);
    const res = await fetchData({
      url: `/withdrawAddress/makedefault/${id}`,
      method: 'PATCH',
      data: {
        _id: id,
      },
    });
    if (res?.status == 200) {
      getAddresses();
      closeMenu();
    }
    // Handle setting default address
    // console.log('Set default:', id);
  };
  const deleteAddress = async (id: string) => {
    const res = await fetchData({
      url: `/withdrawAddress/deleteaddress/${id}`,
      method: 'DELETE',
      data: {
        _id: id,
      },
    });
    console.log(res);
    if (res?.status == 200) {
      getAddresses();
      closeMenu();
      setVisible(false);
    } else {
      showNotification(res.message, 'error');
    }
    // Handle setting default address
    // console.log('Set default:', id);
  };

  const handleDelete = (id: string) => {
    // Handle delete address
    console.log('Delete:', id);
    setVisible(true);
    setMenuVisible(false);
  };

  const renderAddressIcon = (type: string) => {
    switch (type) {
      case 'upi':
        return <FontAwesome name="mobile" size={24} color="#6200ee" />;
      case 'bank_account':
        return <FontAwesome name="bank" size={24} color="#03a9f4" />;
      case 'crypto_wallet':
        return <FontAwesome name="btc" size={24} color="#f7931a" />;
      default:
        return <MaterialIcons name="payment" size={24} color="#6200ee" />;
    }
  };

  const renderAddressDetails = (address: string) => {
    switch (address.type) {
      case 'upi':
        return (
          <View>
            <Text style={styles.detailText}>
              UPI ID: {address.details.upi_id}
            </Text>
            <Text style={styles.detailText}>
              Provider: {address.details.provider}
            </Text>
          </View>
        );
      case 'bank_account':
        return (
          <View>
            <Text style={styles.detailText}>
              Account: {address.details.account_number}
            </Text>
            <Text style={styles.detailText}>
              Bank: {address.details.bank_name}
            </Text>
            <Text style={styles.detailText}>
              IFSC: {address.details.ifsc_code}
            </Text>
          </View>
        );
      case 'crypto_wallet':
        return (
          <View>
            <Text style={styles.detailText}>
              Address: {address.details.wallet_address}
            </Text>
            <Text style={styles.detailText}>
              Network: {address.details.network}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderItem = ({item}: any) => (
    <TouchableOpacity
      style={[styles.addressCard, item.is_default && styles.defaultCard]}
      onPress={() => setSelectedAddress(item)}>
      <View style={styles.cardHeader}>
        {renderAddressIcon(item.type)}
        <Text style={styles.cardTitle}>{item.nickname}</Text>
        {item.is_default && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}

        <Menu
          visible={menuVisible && selectedAddress?._id === item._id}
          onDismiss={closeMenu}
          anchor={
            <IconButton
              icon="dots-vertical"
              onPress={() => {
                setSelectedAddress(item);
                openMenu();
              }}
            />
          }>
          <Menu.Item
            onPress={() => {
              handleSetDefault(item._id);
            }}
            title="Set as default"
          />
          <Menu.Item
            onPress={() => {
              //   deleteAddress(item._id)
              handleDelete(item._id);
            }}
            title="Delete"
          />
        </Menu>
      </View>
      <Divider style={styles.divider} />
      {renderAddressDetails(item)}
    </TouchableOpacity>
  );

  const setNickName = (value: string) => {
    // addressType
    if (addressType == 'upi') {
      setUpiInput(pre => ({...pre, nickname: value}));
    }
    if (addressType == 'bank_account') {
      setBankInput(pre => ({...pre, nickname: value}));
    }
    if (addressType === 'crypto_wallet') {
      setCryptoInput(pre => ({...pre, nickname: value}));
    }
  };
  const showNickName = () => {
    if (addressType == 'upi') {
      return upiInput.nickname;
    }
    if (addressType == 'bank_account') {
      return bankInput.nickname;
    }
    if (addressType === 'crypto_wallet') {
      return cryptoInput.nickname;
    }
  };
  const inputValueFn = (
    type: string,
    value: string,
    field: string,
    nesting: string,
  ) => {
    if (type == 'upi') {
      setUpiInput(prev => ({
        ...prev,
        [field]: {
          ...prev.details,
          [nesting]: value,
        },
      }));
    }
    if (type === 'bank_details') {
      setBankInput(prev => ({
        ...prev,
        [field]: {
          ...prev.details,
          [nesting]: value,
        },
      }));
    }
    if (type === 'crypto') {
      setCryptoInput(prev => ({
        ...prev,
        [field]: {
          ...prev.details,
          [nesting]: value,
        },
      }));
    }
  };

  //   <=========================================submit =====================================>
  const submitData = async () => {
    let payload;
    switch (addressType) {
      case 'upi':
        payload = {...upiInput, type: 'UPI'};
        break;
      case 'bank_account':
        payload = {...bankInput, type: 'BANK_ACCOUNT'};
        break;

      case 'crypto_wallet':
        payload = {...cryptoInput, type: 'CRYPTO_WALLET'};
        break;
    }

    const res = await fetchData({
      url: '/withdrawAddress/addAddress',
      method: 'POST',
      data: payload,
    });
    console.log(res);
    if (res?.status == 201 || 200) {
      if (addressType == 'upi') {
        setUpiInput(upid);
      }
      if (addressType == 'crypto_wallet') {
        setCryptoInput(crypto);
      }
      if (addressType == 'bank_account') {
        setBankInput(bankdetails);
      }
      getAddresses();
      setShowAddModal(false);
    }
    // console.log(payload);
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          zIndex: 9999,
        }}>
        <Toast position="top" swipeable topOffset={10} />
      </View>
      <Appbar.Header style={styles.header}>
        <Appbar.Action icon="menu" onPress={openSidebar} />
        <Appbar.Content title="Withdrawal Addresses" />
        <Appbar.Action icon="plus" onPress={() => setShowAddModal(true)} />
      </Appbar.Header>
      {withdrawalAddresses.length ? (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Your Withdrawal Addresses</Text>

          <FlatList
            data={withdrawalAddresses}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}>
            <MaterialIcons name="add" size={24} color="#6200ee" />
            <Text style={styles.addButtonText}>Add New Withdrawal Address</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <NotFound
          icon="wallet-outline"
          title="No Payment Methods"
          description="You haven't added any payment options yet"
          actionText="Add Payment Method"
          onActionPress={() => setShowAddModal(true)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete Address</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this withdrawal address?
            </Text>
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                style={styles.modalButton}
                onPress={() => setVisible(false)}>
                Cancel
              </Button>
              <Button
                mode="contained"
                style={styles.modalButton}
                // onPress={() => handleDelete(selectedAddress?.id)}
                onPress={() => deleteAddress(selectedAddress?._id)}>
                Delete
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Add New Address Modal */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.addModalContainer}>
          <ScrollView style={styles.addModalScroll}>
            {/* <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Withdrawal Address</Text>
              <IconButton icon="close" onPress={() => setShowAddModal(false)} />
            </View> */}

            {/* <Text style={styles.inputLabel}>Address Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  addressType === 'upi' && styles.typeOptionSelected,
                ]}
                onPress={() => setAddressType('upi')}>
                <FontAwesome name="mobile" size={24} color="#6200ee" />
                <Text style={styles.typeOptionText}>UPI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeOption,
                  addressType === 'bank_account' && styles.typeOptionSelected,
                ]}
                onPress={() => setAddressType('bank_account')}>
                <FontAwesome name="bank" size={24} color="#03a9f4" />
                <Text style={styles.typeOptionText}>Bank</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeOption,
                  addressType === 'crypto_wallet' && styles.typeOptionSelected,
                ]}
                onPress={() => setAddressType('crypto_wallet')}>
                <FontAwesome name="btc" size={24} color="#f7931a" />
                <Text style={styles.typeOptionText}>Crypto</Text>
              </TouchableOpacity>
            </View> */}

            <TextInput
              label="Nickname"
              mode="outlined"
              style={styles.input}
              placeholder="e.g. My Primary UPI"
              value={showNickName()}
              onChangeText={val => setNickName(val)}
            />

            {/* {addressType === 'upi' && (
              <>
                <TextInput
                  label="UPI ID"
                  mode="outlined"
                  style={styles.input}
                  placeholder="username@upi"
                  value={upiInput.details.upi_id}
                  onChangeText={val =>
                    inputValueFn('upi', val, 'details', 'upi_id')
                  }
                />
                <TextInput
                  label="Provider (optional)"
                  mode="outlined"
                  style={styles.input}
                  placeholder="e.g. Google Pay, PhonePe"
                  value={upiInput.details.provider}
                  onChangeText={val =>
                    inputValueFn('upi', val, 'details', 'provider')
                  }
                />
              </>
            )} */}

            {/* {addressType === 'bank_account' && (
              <>
                <TextInput
                  label="Account Holder Name"
                  mode="outlined"
                  style={styles.input}
                  value={bankInput.details.account_holder_name}
                  onChangeText={val =>
                    inputValueFn(
                      'bank_details',
                      val,
                      'details',
                      'account_holder_name',
                    )
                  }
                />
                <TextInput
                  label="Account Number"
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                  value={bankInput.details.account_number}
                  onChangeText={val =>
                    inputValueFn(
                      'bank_details',
                      val,
                      'details',
                      'account_number',
                    )
                  }
                />
                <TextInput
                  label="Bank Name"
                  mode="outlined"
                  style={styles.input}
                  value={bankInput.details.bank_name}
                  onChangeText={val =>
                    inputValueFn('bank_details', val, 'details', 'bank_name')
                  }
                />
                <TextInput
                  label="IFSC Code"
                  mode="outlined"
                  style={styles.input}
                  value={bankInput.details.ifsc_code}
                  onChangeText={val =>
                    inputValueFn('bank_details', val, 'details', 'ifsc_code')
                  }
                />
                <TextInput
                  label="Account Type"
                  mode="outlined"
                  style={styles.input}
                  placeholder="Savings or Current"
                  value={bankInput.details.account_type}
                  onChangeText={val =>
                    inputValueFn('bank_details', val, 'details', 'account_type')
                  }
                />
              </>
            )} */}

            {addressType === 'crypto_wallet' && (
              <>
                <TextInput
                  label="Wallet Address"
                  mode="outlined"
                  style={styles.input}
                  value={cryptoInput.details.wallet_address}
                  onChangeText={val =>
                    inputValueFn('crypto', val, 'details', 'wallet_address')
                  }
                />
                <TextInput
                  label="Network"
                  mode="outlined"
                  style={styles.input}
                  placeholder="e.g. Ethereum, Bitcoin"
                  value={cryptoInput.details.network}
                  onChangeText={val =>
                    inputValueFn('crypto', val, 'details', 'network')
                  }
                />
                {/* <TextInput
                  label="Memo (optional)"
                  mode="outlined"
                  style={styles.input}
                /> */}
              </>
            )}

            <Button
              mode="contained"
              style={styles.submitButton}
              onPress={() => {
                // Handle form submission
                // setShowAddModal(false);
                submitData();
              }}>
              SAVE{' '}
              {addressType == 'upi'
                ? 'UPI DETAILS'
                : addressType == 'crypto_wallet'
                ? 'CRYPTO ADDRESS'
                : 'BANK DETAILS'}
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    width: '100%',
    elevation: 0,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: wp(4),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: '600',
    marginBottom: hp(2),
    color: '#333',
  },
  listContainer: {
    paddingBottom: hp(2),
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(1.5),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  defaultCard: {
    borderLeftWidth: wp(1),
    borderLeftColor: '#6200ee',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  cardTitle: {
    fontSize: wp(4),
    fontWeight: '600',
    marginLeft: wp(3),
    flex: 1,
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: wp(1),
    marginRight: wp(2),
  },
  defaultBadgeText: {
    color: '#2e7d32',
    fontSize: wp(3),
    fontWeight: '500',
  },
  unverifiedBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: wp(1),
    marginRight: wp(2),
  },
  unverifiedBadgeText: {
    color: '#c62828',
    fontSize: wp(3),
    fontWeight: '500',
  },
  divider: {
    marginVertical: hp(1),
    backgroundColor: '#eee',
  },
  detailText: {
    fontSize: wp(3.5),
    color: '#666',
    marginBottom: hp(0.5),
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: wp(4),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: '#6200ee',
    borderStyle: 'dashed',
    marginBottom: hp(5),
  },
  addButtonText: {
    color: '#6200ee',
    fontSize: wp(4),
    fontWeight: '500',
    marginLeft: wp(2),
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: wp(5),
    margin: wp(5),
    borderRadius: wp(2),
  },
  modalTitle: {
    fontSize: wp(4.5),
    fontWeight: '600',
    marginBottom: hp(2),
    color: '#333',
  },
  modalText: {
    fontSize: wp(4),
    marginBottom: hp(3),
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    marginLeft: wp(2),
    minWidth: wp(20),
  },
  addModalContainer: {
    backgroundColor: 'white',
    margin: wp(3),
    borderRadius: wp(2),
    maxHeight: hp(80),
  },
  addModalScroll: {
    padding: wp(4),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  inputLabel: {
    fontSize: wp(3.8),
    color: '#666',
    marginBottom: hp(1),
    marginTop: hp(1),
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  typeOption: {
    alignItems: 'center',
    padding: wp(3),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: '#eee',
    width: wp(28),
  },
  typeOptionSelected: {
    borderColor: '#6200ee',
    backgroundColor: '#f3e5f5',
  },
  typeOptionText: {
    marginTop: hp(1),
    fontSize: wp(3.5),
    color: '#333',
  },
  input: {
    marginBottom: hp(2),
    backgroundColor: '#fff',
  },
  submitButton: {
    marginTop: hp(2),
    paddingVertical: hp(1),
    marginBottom: hp(5),
  },
});
