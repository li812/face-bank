import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FamilyDashboard from './FamilyDashboard';
import FamilyMakeTransaction from './FamilyMakeTransaction';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const FamilyBase = ({ navigation }: any) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');

  // Get username when component mounts
  useEffect(() => {
    const getUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    getUsername();
  }, []);

  // Handle logout process
  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // Clear all stored authentication data
      await AsyncStorage.multiRemove([
        'sessionid',
        'userType',
        'username',
        'isLoggedIn'
      ]);
      
      // Navigate back to home screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setMenuVisible(false);
    }
  };

  // Custom tab bar button for the profile menu
  const ProfileButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity 
      style={styles.profileButton} 
      onPress={onPress}
    >
      <Icon name="account-circle" size={28} color="#00a8ff" />
    </TouchableOpacity>
  );

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = '';
            
            if (route.name === 'Dashboard') {
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
            } else if (route.name === 'SendMoney') {
              iconName = focused ? 'bank-transfer' : 'bank-transfer-outline';
            }
            
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#00a8ff',
          tabBarInactiveTintColor: 'gray',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500'
          },
          headerShown: false
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={FamilyDashboard} 
          options={{
            title: 'Dashboard'
          }}
        />
        <Tab.Screen 
          name="SendMoney" 
          component={FamilyMakeTransaction} 
          options={{
            title: 'Send Money'
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={View} // Dummy component, never shown
          options={{
            tabBarButton: (props) => (
              <ProfileButton onPress={() => setMenuVisible(true)} />
            )
          }}
          listeners={{
            tabPress: (e) => {
              // Prevent default action
              e.preventDefault();
              // Open menu modal
              setMenuVisible(true);
            },
          }}
        />
      </Tab.Navigator>

      {/* User Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuUsername}>{username}</Text>
              <Text style={styles.menuSubtitle}>Family Member Account</Text>
            </View>
            
            <View style={styles.menuOptions}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  // navigation.navigate('ViewTransactions');
                  // Not implemented for family members
                  Alert.alert('Info', 'Feature not available for family members');
                }}
              >
                <Icon name="history" size={24} color="#333" />
                <Text style={styles.menuItemText}>Transaction History</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  // navigation.navigate('SendComplaints');
                  // Not implemented for family members
                  Alert.alert('Info', 'Feature not available for family members');
                }}
              >
                <Icon name="message-alert" size={24} color="#333" />
                <Text style={styles.menuItemText}>Send Complaint</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="logout" size={20} color="#fff" />
                  <Text style={styles.logoutText}>Logout</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Same styles as UserBase
  profileButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '50%',
  },
  menuHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuUsername: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  menuOptions: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 18,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#f44336',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default FamilyBase;