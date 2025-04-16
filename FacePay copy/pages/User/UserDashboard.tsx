import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Image, ActivityIndicator } from 'react-native'
import axios from 'axios'
import { API_URL } from '../../config'

const UserDashboard = ({ username, navigation }) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get(`${API_URL}/userAccount`, {
          headers: { Accept: 'application/json' }
        })
        setAccounts(response.data.user_account || [])
      } catch (err) {
        setError('Failed to load account data')
      }
      setLoading(false)
    }
    fetchAccounts()
  }, [])

  const totalBalance = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0)

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/icons/user-avatar.png')}
          style={styles.avatar}
        />
        <Text style={styles.welcome}>Welcome, {username}!</Text>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        {loading ? (
          <ActivityIndicator color="#00abe9" size="large" style={{ marginVertical: 12 }} />
        ) : error ? (
          <Text style={[styles.balance, { color: 'red', fontSize: 16 }]}>{error}</Text>
        ) : accounts.length === 0 ? (
          <>
            <Text style={styles.balance}>₹ 0.00</Text>
            <Text style={{ color: '#fff', marginTop: 8, marginBottom: 8, fontSize: 16 }}>
              No accounts found.
            </Text>
            <TouchableOpacity
              style={[styles.card, { backgroundColor: '#00abe9', marginTop: 8 }]}
              onPress={() => navigation.navigate('AddAccount')}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Add Your First Account</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.balance}>₹ {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
        )}
      </View>
      <View style={styles.cardsRow}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AddAccount')}>
          <Image source={require('../../assets/icons/add-account.png')} style={styles.cardIcon} />
          <Text style={styles.cardText}>Add Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ApplyLoan')}>
          <Image source={require('../../assets/icons/loan.png')} style={styles.cardIcon} />
          <Text style={styles.cardText}>Apply Loan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SendComplaints')}>
          <Image source={require('../../assets/icons/complaint.png')} style={styles.cardIcon} />
          <Text style={styles.cardText}>Send Complaint</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardsRow}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ViewAccount')}>
          <Image source={require('../../assets/icons/account.png')} style={styles.cardIcon} />
          <Text style={styles.cardText}>View Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AddFamily')}>
          <Image source={require('../../assets/icons/family.png')} style={styles.cardIcon} />
          <Text style={styles.cardText}>Add Family</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ManageComplaints')}>
          <Image source={require('../../assets/icons/manage.png')} style={styles.cardIcon} />
          <Text style={styles.cardText}>Manage Complaints</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardsRow}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('UserMakeTransaction')}>
          <Image source={require('../../assets/icons/send-money.png')} style={styles.cardIcon} />
          <Text style={styles.cardText}>Send Money</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ViewTransactions')}>
          <Image source={require('../../assets/icons/transactions.png')} style={styles.cardIcon} />
          <Text style={styles.cardText}>Transactions</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 12,
    backgroundColor: Platform.OS === 'ios'
      ? 'rgba(20, 20, 30, 0.85)'
      : 'rgba(10, 10, 20, 0.95)',
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
    padding: 24,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#00abe9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        backdropFilter: 'blur(24px)'
      },
      android: {
        elevation: 8
      }
    })
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#00abe9',
    backgroundColor: '#fff'
  },
  welcome: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 2,
    letterSpacing: 1,
  },
  balance: {
    color: '#00abe9',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
    textShadowColor: 'rgba(0,171,233,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
    gap: 12,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 24,
    paddingVertical: 22,
    marginHorizontal: 4,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#00abe9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 12,
        backdropFilter: 'blur(12px)'
      },
      android: {
        elevation: 4
      }
    })
  },
  cardIcon: {
    width: 36,
    height: 36,
    marginBottom: 10,
    tintColor: '#00abe9',
    opacity: 0.95
  },
  cardText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center'
  }
})

export default UserDashboard