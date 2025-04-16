import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Platform, ScrollView, TouchableOpacity, TextInput, Dimensions, Image, Modal, FlatList } from 'react-native'
import { BlurView } from 'expo-blur'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { MaterialIcons } from '@expo/vector-icons'

const { width, height } = Dimensions.get('window')

interface CurrencyMap { [key: string]: string }
interface RateMap { [key: string]: number }

const ExchangeRate = ({ navigation }) => {
  const [currencies, setCurrencies] = useState<CurrencyMap>({})
  const [base, setBase] = useState('USD')
  const [target, setTarget] = useState('INR')
  const [amount, setAmount] = useState('1')
  const [converted, setConverted] = useState('')
  const [rates, setRates] = useState<RateMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currLoading, setCurrLoading] = useState(true)
  const [showBasePicker, setShowBasePicker] = useState(false)
  const [showTargetPicker, setShowTargetPicker] = useState(false)

  // Fetch available currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      setCurrLoading(true)
      try {
        const res = await fetch('https://api.frankfurter.app/currencies')
        const data = await res.json()
        setCurrencies(data)
        setError('')
      } catch {
        setError('Failed to load currencies')
      }
      setCurrLoading(false)
    }
    fetchCurrencies()
  }, [])

  // Fetch rates for base currency
  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`https://api.frankfurter.app/latest?base=${base}`)
        const data = await res.json()
        setRates(data.rates || {})
      } catch {
        setError('Failed to fetch rates')
      }
      setLoading(false)
    }
    if (base) fetchRates()
  }, [base])

  // Conversion handler
  const handleConvert = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setConverted('Enter valid amount')
      return
    }
    if (base === target) {
      setConverted(amount)
      return
    }
    setConverted('...')
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${base}&to=${target}`)
      const data = await res.json()
      setConverted(data.rates && data.rates[target] ? data.rates[target].toString() : 'N/A')
    } catch {
      setConverted('Error')
    }
  }

  // Clear conversion result on change
  useEffect(() => {
    setConverted('')
  }, [base, target, amount])

  // Retry handler
  const handleRetry = () => {
    setError('')
    setCurrLoading(true)
    setLoading(true)
    setCurrencies({})
    setRates({})
    setBase('USD')
    setTarget('INR')
    setAmount('1')
    setConverted('')
  }

  // Currency picker modal
  const renderCurrencyModal = (visible: boolean, onSelect: (v: string) => void, onClose: () => void, exclude?: string) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Currency</Text>
          <FlatList
            data={Object.keys(currencies).filter(cur => !exclude || cur !== exclude)}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => { onSelect(item); onClose(); }}
                accessibilityLabel={`Select ${item}`}
              >
                <Text style={styles.modalItemText}>{item} - {currencies[item]}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <Image
        source={require('../../assets/background/bg1.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
      />
      <View style={styles.gradient} pointerEvents="none" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
          <MaterialIcons name="currency-exchange" size={48} color="#00abe9" style={{ marginBottom: 8 }} />
          <Text style={styles.heading}>Currency Exchange</Text>
          <Text style={styles.subheading}>Get real-time rates and convert instantly</Text>
        </View>

        {/* Conversion Tool */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Currency Converter</Text>
          <Text style={styles.label}>From</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowBasePicker(true)}
            disabled={currLoading}
            accessibilityLabel="Select base currency"
          >
            <Text style={styles.pickerButtonText}>{base} - {currencies[base]}</Text>
          </TouchableOpacity>
          <Text style={styles.label}>To</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowTargetPicker(true)}
            disabled={currLoading}
            accessibilityLabel="Select target currency"
          >
            <Text style={styles.pickerButtonText}>{target} - {currencies[target]}</Text>
          </TouchableOpacity>
          <View style={styles.converterRow}>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="Amount"
              placeholderTextColor="#888"
              accessibilityLabel="Amount to convert"
            />
            <TouchableOpacity style={styles.convertButton} onPress={handleConvert} accessibilityLabel="Convert currency">
              <Text style={styles.convertButtonText}>Convert</Text>
            </TouchableOpacity>
          </View>
          {converted !== '' && (
            <Text style={styles.convertedText}>
              {amount} {base} = {converted} {target}
            </Text>
          )}
        </View>

        {/* Latest Rates */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Latest {base} Rates</Text>
          {loading || currLoading ? (
            <ActivityIndicator color="#00abe9" style={{ marginTop: 16 }} />
          ) : error ? (
            <View>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.convertButton} onPress={handleRetry}>
                <Text style={styles.convertButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.ratesList}>
              {Object.entries(rates).map(([currency, rate]) => (
                <View key={currency} style={styles.rateRow}>
                  <Text style={styles.currency}>{currency} ({currencies[currency] || ''})</Text>
                  <Text style={styles.rate}>{rate}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
      {renderCurrencyModal(showBasePicker, setBase, () => setShowBasePicker(false), target)}
      {renderCurrencyModal(showTargetPicker, setTarget, () => setShowTargetPicker(false), base)}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: undefined,
    height: undefined,
    zIndex: 0
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 10,
    zIndex: 2,
    minHeight: height,
    paddingBottom: 90,
  },
  headerContainer: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 12,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 4,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00abe9',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 0,
    marginTop: 0,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subheading: {
    color: '#555',
    fontSize: 15,
    marginTop: 6,
    marginBottom: 0,
    textAlign: 'center'
  },
  card: {
    width: '100%',
    maxWidth: 480,
    marginBottom: 18,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.13)',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#00abe9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 12,
      },
      android: {
        elevation: 3
      }
    })
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00abe9',
    marginBottom: 10,
    textAlign: 'center'
  },
  label: {
    color: '#00abe9',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    fontSize: 15,
    alignSelf: 'flex-start'
  },
  pickerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00abe9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginVertical: 6,
    alignItems: 'center',
    width: '100%',
  },
  pickerButtonText: {
    color: '#00abe9',
    fontWeight: 'bold',
    fontSize: 16,
  },
  converterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    width: '100%',
    justifyContent: 'center'
  },
  amountInput: {
    width: 100,
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 110, 157, 0.42)',
    color: '#222',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 8,
    textAlign: 'center'
  },
  convertButton: {
    backgroundColor: '#00abe9',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginLeft: 8,
  },
  convertButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  convertedText: {
    marginTop: 10,
    color: '#00abe9',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center'
  },
  ratesList: {
    width: '100%',
    marginTop: 8,
    maxHeight: 300,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,171,233,0.13)',
  },
  currency: {
    color: '#222',
    fontWeight: '600',
    fontSize: 16,
  },
  rate: {
    color: '#00abe9',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  modalItemText: {
    fontSize: 16,
    color: '#222',
  },
  modalButton: {
    backgroundColor: '#00abe9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default ExchangeRate