import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TextInput, Dimensions, Image, Modal, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { MaterialIcons } from '@expo/vector-icons'

// Import unified styling
import styleSheet, { colors, typography, layout, components, exchangeRate } from '../../appStyleSheet'
import CrossPlatformBlur from '../../components/CrossPlatformBlur'
import CrossPlatformTouchable from '../../components/CrossPlatformTouchable'
import { IS_IOS, FONT_FAMILY } from '../../utils/platformUtils'

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
      <View style={exchangeRate.modalOverlay}>
        <View style={exchangeRate.modalContainer}>
          <Text style={exchangeRate.modalTitle}>Select Currency</Text>
          <FlatList
            data={Object.keys(currencies).filter(cur => !exclude || cur !== exclude)}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <CrossPlatformTouchable
                style={exchangeRate.modalItem}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <Text style={exchangeRate.modalItemText}>{item} - {currencies[item]}</Text>
              </CrossPlatformTouchable>
            )}
          />
          <CrossPlatformTouchable style={exchangeRate.modalButton} onPress={onClose}>
            <Text style={exchangeRate.modalButtonText}>Close</Text>
          </CrossPlatformTouchable>
        </View>
      </View>
    </Modal>
  )

  return (
    <SafeAreaView style={layout.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <Image
        source={require('../../assets/background/bg1.png')}
        style={components.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
      />
      <View style={components.gradient} pointerEvents="none" />
      <ScrollView contentContainerStyle={layout.container}>
        <View style={components.headerContainer}>
          <CrossPlatformBlur 
            intensity={100}
            tint="light"
            style={StyleSheet.absoluteFill}
            fallbackColor="rgba(255, 255, 255, 0.15)" 
          />
          <MaterialIcons name="currency-exchange" size={48} color={colors.primary} style={{ marginBottom: 8 }} />
          <Text style={typography.heading}>Currency Exchange</Text>
          <Text style={[typography.subHeading, { textAlign: 'center' }]}>Get real-time rates and convert instantly</Text>
        </View>

        {/* Conversion Tool */}
        <View style={components.formCard}>
          <CrossPlatformBlur 
            intensity={80}
            tint="light"
            style={StyleSheet.absoluteFill}
            fallbackColor="rgba(255, 255, 255, 0.1)"
          />
          <Text style={typography.pickerLabel}>Currency Converter</Text>
          <Text style={typography.label}>From</Text>
          <CrossPlatformTouchable
            style={exchangeRate.pickerButton}
            onPress={() => setShowBasePicker(true)}
            disabled={currLoading}
          >
            <Text style={exchangeRate.pickerButtonText}>{base} - {currencies[base]}</Text>
          </CrossPlatformTouchable>
          <Text style={typography.label}>To</Text>
          <CrossPlatformTouchable
            style={exchangeRate.pickerButton}
            onPress={() => setShowTargetPicker(true)}
            disabled={currLoading}
          >
            <Text style={exchangeRate.pickerButtonText}>{target} - {currencies[target]}</Text>
          </CrossPlatformTouchable>
          <View style={exchangeRate.converterRow}>
            <TextInput
              style={exchangeRate.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="Amount"
              placeholderTextColor="#888"
            />
            <CrossPlatformTouchable style={exchangeRate.convertButton} onPress={handleConvert}>
              <Text style={exchangeRate.convertButtonText}>Convert</Text>
            </CrossPlatformTouchable>
          </View>
          {converted !== '' && (
            <Text style={exchangeRate.convertedText}>
              {amount} {base} = {converted} {target}
            </Text>
          )}
        </View>

        {/* Latest Rates */}
        <View style={components.formCard}>
          <CrossPlatformBlur 
            intensity={80}
            tint="light"
            style={StyleSheet.absoluteFill}
            fallbackColor="rgba(255, 255, 255, 0.1)"
          />
          <Text style={typography.pickerLabel}>Latest {base} Rates</Text>
          {loading || currLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
          ) : error ? (
            <View>
              <Text style={components.errorText}>{error}</Text>
              <CrossPlatformTouchable style={exchangeRate.convertButton} onPress={handleRetry}>
                <Text style={exchangeRate.convertButtonText}>Retry</Text>
              </CrossPlatformTouchable>
            </View>
          ) : (
            <ScrollView style={exchangeRate.ratesList}>
              {Object.entries(rates).map(([currency, rate]) => (
                <View key={currency} style={exchangeRate.rateRow}>
                  <Text style={exchangeRate.currency}>{currency} ({currencies[currency] || ''})</Text>
                  <Text style={exchangeRate.rate}>{rate}</Text>
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

export default ExchangeRate