import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import useAxios from '../hooks/useAxios';
import { Appbar, SegmentedButtons } from 'react-native-paper';
import { useSidebar } from '../context/SidebarContext';
import { wp } from '../helper/hpwp';
import MenuSvg from '../../assets/svg/menu.svg';

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

export default function TeamRolls() {
  const { fetchData } = useAxios();
  const [teamData, setTeamData] = useState(null);
  const { openSidebar } = useSidebar();
  const [timeframe, setTimeframe] = useState('today');
  const [loading, setLoading] = useState(false);

  const downlineRolls = async () => {
    setLoading(true);
    try {
      const res = await fetchData({
        url: `/user/auth/downlinerolls?timeframe=${timeframe}`,
        method: 'GET',
      });
      setTeamData(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    downlineRolls();
  }, [timeframe]);

  // Calculate rolled vs not rolled users
  const rolledUsers = teamData?.users?.filter(user => user.count > 0) || [];
  const notRolledUsers = teamData?.users?.filter(user => user.count === 0) || [];

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ width: wp(100) }}>
        <Appbar.Action
          icon={() => (
            <View>
              <MenuSvg width={25} height={25} />
            </View>
          )}
          onPress={openSidebar}
        />
        <Appbar.Content title="Team Rolls" />
      </Appbar.Header>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={timeframe}
          onValueChange={setTimeframe}
          buttons={[
            {
              value: '1hr',
              label: '1 Hour',
            },
            {
              value: 'today',
              label: 'Today',
            },
            {
              value: '7days',
              label: '7days',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{teamData?.totalCount || 0}</Text>
          <Text style={styles.statLabel}>Total Rolls</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.rolledText]}>{rolledUsers.length}</Text>
          <Text style={styles.statLabel}>User Rolled Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.notRolledText]}>{notRolledUsers.length}</Text>
          <Text style={styles.statLabel}>User Not Rolled</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        >
          {teamData?.users?.map((user, index) => (
            <View key={user.userId} style={styles.userCard}>
              <View style={styles.cardHeader}>
                <View style={[
                  styles.userNumber,
                  user.count > 0 ? styles.rolledBadge : styles.notRolledBadge
                ]}>
                  <Text style={styles.userNumberText}>{index + 1}</Text>
                </View>
                <View>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.levelBadge}>
                    <LevelIcon />
                    <Text style={styles.levelText}>Level {user.level || 1}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <PhoneIcon />
                  <Text style={styles.detailText}>{user.phone || 'N/A'}</Text>
                </View>

                <View style={styles.detailItem}>
                  <RollIcon />
                  <Text style={[
                    styles.detailText,
                    user.count > 0 ? styles.rolledText : styles.notRolledText
                  ]}>
                    {user.count} Rolls
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical:5,
    paddingHorizontal:7,
    paddingBottom:20
  },
  filterContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  segmentedButtons: {
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  rolledText: {
    color: '#10b981', // green
  },
  notRolledText: {
    color: '#ef4444', // red
  },
  rolledBadge: {
    backgroundColor: '#10b981',
  },
  notRolledBadge: {
    backgroundColor: '#ef4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 12,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userNumberText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '500',
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
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  detailText: {
    marginLeft: 6,
    color: '#64748b',
    fontSize: 16,
    fontWeight: '800',
  },
});