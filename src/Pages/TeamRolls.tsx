import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import useAxios from '../hooks/useAxios';
import { Appbar, SegmentedButtons, Chip, Searchbar } from 'react-native-paper';
import { useSidebar } from '../context/SidebarContext';
import { wp } from '../helper/hpwp';
import MenuSvg from '../../assets/svg/menu.svg';

// SVG Icons as components
const UserIcon = () => (
  <Image
    source={{
      uri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234F46E5"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
    }}
    style={{ width: 16, height: 16 }}
  />
);

const LevelIcon = () => (
  <Image
    source={{
      uri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234F46E5"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z"/></svg>',
    }}
    style={{ width: 16, height: 16 }}
  />
);

const PhoneIcon = () => (
  <Image
    source={{
      uri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234F46E5"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>',
    }}
    style={{ width: 16, height: 16 }}
  />
);

const RollIcon = () => (
  <Image
    source={{
      uri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234F46E5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h4v10z"/></svg>',
    }}
    style={{ width: 16, height: 16 }}
  />
);

const FilterIcon = () => (
  <Image
    source={{
      uri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234F46E5"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>',
    }}
    style={{ width: 16, height: 16 }}
  />
);

export default function TeamRolls() {
  const { fetchData } = useAxios();
  const [teamData, setTeamData] = useState(null);
  const { openSidebar } = useSidebar();
  const [timeframe, setTimeframe] = useState('today');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'rolled', 'notRolled'
  const [filteredUsers, setFilteredUsers] = useState([]);

  const downlineRolls = async () => {
    setLoading(true);
    try {
      const res = await fetchData({
        url: `/user/auth/downlinerolls?timeframe=${timeframe}`,
        method: 'GET',
      });
      
      setTeamData(res.data.data);
    } catch (error) {
      console.log('Error fetching team rolls:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    downlineRolls();
  }, [timeframe]);

  useEffect(() => {
    if (teamData?.users) {
      let filtered = teamData.users;
      
      // Apply roll filter
      if (filter === 'rolled') {
        filtered = filtered.filter(user => user.count > 0);
      } else if (filter === 'notRolled') {
        filtered = filtered.filter(user => user.count === 0);
      }
      
      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(user => 
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.referCode?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setFilteredUsers(filtered);
    }
  }, [teamData, filter, searchQuery]);

  // Calculate statistics
  const rolledUsers = teamData?.users?.filter(user => user.count > 0) || [];
  const notRolledUsers = teamData?.users?.filter(user => user.count === 0) || [];

  const UserCard = ({ user, index }) => (
    <View style={styles.userCard}>
      <View style={styles.cardHeader}>
        <View style={[
          styles.userNumber,
          user.count > 0 ? styles.rolledBadge : styles.notRolledBadge
        ]}>
          <Text style={styles.userNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user.level === 1 ? user.email : `Ref: ${user.referCode}`}
          </Text>
          <View style={styles.levelBadge}>
            <LevelIcon />
            <Text style={styles.levelText}>Level {user.level || 1}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsRow}>
        {user.level === 1 && user.phone && (
          <View style={styles.detailItem}>
            <PhoneIcon />
            <Text style={styles.detailText}>{user.phone}</Text>
          </View>
        )}
        
        <View style={[
          styles.detailItem,
          styles.rollCountItem,
          user.count > 0 ? styles.rolledItem : styles.notRolledItem
        ]}>
          <RollIcon />
          <Text style={[
            styles.detailText,
            user.count > 0 ? styles.rolledText : styles.notRolledText
          ]}>
            {user.count} Roll{user.count !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ width: wp(100) }}>
        <Appbar.Action
          icon={() => <MenuSvg width={25} height={25} />}
          onPress={openSidebar}
        />
        <Appbar.Content title="Team Rolls" />
      </Appbar.Header>

      {/* Timeframe Filter */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={timeframe}
          onValueChange={setTimeframe}
          buttons={[
            { value: '1hr', label: '1 Hour' },
            { value: 'today', label: 'Today' },
            { value: '7days', label: '7 Days' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        {/* <Searchbar
          placeholder="Search users..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        /> */}
        <View style={styles.chipContainer}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={styles.chip}
            selectedColor="#4f46e5"
          >
            All ({teamData?.users?.length || 0})
          </Chip>
          <Chip
            selected={filter === 'rolled'}
            onPress={() => setFilter('rolled')}
            style={styles.chip}
            selectedColor="#10b981"
          >
            Rolled ({rolledUsers.length})
          </Chip>
          <Chip
            selected={filter === 'notRolled'}
            onPress={() => setFilter('notRolled')}
            style={styles.chip}
            selectedColor="#ef4444"
          >
            Not Rolled ({notRolledUsers.length})
          </Chip>
        </View>
      </View>

      {/* Statistics Cards */}
      {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.totalCard]}>
            <Text style={styles.statNumber}>{teamData?.totalCount || 0}</Text>
            <Text style={styles.statLabel}>Total Rolls</Text>
          </View>
          <View style={[styles.statCard, styles.rolledCard]}>
            <Text style={[styles.statNumber, styles.rolledText]}>{rolledUsers.length}</Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </View>
          <View style={[styles.statCard, styles.notRolledCard]}>
            <Text style={[styles.statNumber, styles.notRolledText]}>{notRolledUsers.length}</Text>
            <Text style={styles.statLabel}>Inactive Users</Text>
          </View>
          <View style={[styles.statCard, styles.avgCard]}>
            <Text style={styles.statNumber}>
              {teamData?.users?.length ? Math.round(teamData.totalCount / teamData.users.length) : 0}
            </Text>
            <Text style={styles.statLabel}>Avg Rolls/User</Text>
          </View>
        </View>
      </ScrollView> */}

      {/* Users List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading team data...</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultsText}>
            Showing {filteredUsers.length} of {teamData?.users?.length || 0} users
          </Text>
          
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FilterIcon />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No users found' : 'No users match this filter'}
              </Text>
            </View>
          ) : (
            filteredUsers.map((user, index) => (
              <UserCard key={user.userId || index} user={user} index={index} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  segmentedButtons: {
    borderRadius: 8,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBar: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f1f5f9',
  },
  statsScroll: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  totalCard: { backgroundColor: '#e0e7ff' },
  rolledCard: { backgroundColor: '#d1fae5' },
  notRolledCard: { backgroundColor: '#fee2e2' },
  avgCard: { backgroundColor: '#fef3c7' },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  rolledText: {
    color: '#10b981',
  },
  notRolledText: {
    color: '#ef4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 16,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  resultsText: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userNumberText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rolledBadge: {
    backgroundColor: '#10b981',
  },
  notRolledBadge: {
    backgroundColor: '#ef4444',
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  levelText: {
    marginLeft: 4,
    color: '#4f46e5',
    fontWeight: '500',
    fontSize: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    flex: 1,
  },
  rollCountItem: {
    justifyContent: 'center',
  },
  rolledItem: {
    backgroundColor: '#d1fae5',
  },
  notRolledItem: {
    backgroundColor: '#fee2e2',
  },
  detailText: {
    marginLeft: 6,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
});