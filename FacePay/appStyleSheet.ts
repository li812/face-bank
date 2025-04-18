import { StyleSheet } from 'react-native';
import platformUtils, {
  IS_IOS,
  FONT_FAMILY,
  STATUS_BAR_HEIGHT,
  createShadow,
  SCREEN
} from './utils/platformUtils';

const { width, height } = SCREEN;

// Export platform-specific values for direct use in components
export const PLATFORM = {
  IS_IOS,
  IS_ANDROID: !IS_IOS,
  STATUS_BAR_HEIGHT,
  FONT_FAMILY
};

// Colors - Enhanced with a more systematic approach
export const colors = {
  // Primary palette with enhanced contrast
  primary: '#0088cc', // Darker blue with better contrast (4.6:1 against white)
  primaryDark: '#006699', // Even darker for better contrast (5.9:1)
  primaryLight: 'rgba(0, 136, 204, 0.15)', // Adjusted opacity for better readability
  primaryGlass: 'rgba(0, 136, 204, 0.25)',
  primaryBorder: 'rgba(0, 110, 157, 0.5)', // Higher opacity for better visibility
  
  // Secondary palette with improved contrast
  secondary: '#d32f2f', // Slightly darker red with better contrast
  secondaryDark: '#b71c1c',
  secondaryLight: 'rgba(211, 47, 47, 0.15)',
  
  // Neutral colors with better differentiation
  text: '#222222',
  textLight: '#555555', // Darker than before for better readability
  textMuted: 'rgba(34, 34, 34, 0.75)', // Higher opacity for better contrast
  textInverse: '#ffffff', // For text on dark backgrounds
  
  // Pure colors
  white: '#ffffff',
  black: '#000000',
  
  // Enhanced semantic colors with better contrast
  error: '#d32f2f', // Matching secondary for consistency
  success: '#2e7d32', // Darker green for better contrast
  warning: '#f57c00', // Darker orange for better contrast
  info: '#0277bd', // Darker blue for better contrast
  
  // Improved transparency system with higher contrast
  transparent: 'transparent',
  card: 'rgba(255, 255, 255, 0.18)', // Increased opacity
  cardHeader: 'rgba(255, 255, 255, 0.12)',
  buttonOutline: 'rgba(255, 255, 255, 0.14)',
  inputBg: 'rgba(255, 255, 255, 0.85)', // Higher opacity for better readability
  modalOverlay: 'rgba(0, 0, 0, 0.6)', // Higher opacity for better distinction
  
  // Standardized overlay shades
  overlayLight: 'rgba(0, 0, 0, 0.4)', // Higher opacity for better visibility
  overlayMedium: 'rgba(0, 0, 0, 0.6)',
  overlayDark: 'rgba(0, 0, 0, 0.75)',
};

// Re-export the createShadow function from platformUtils
export { createShadow };

// Standard shadow levels for consistent elevation
export const shadows = {
  subtle: (color = colors.black) => createShadow(color, 0.1, 2, 4),
  medium: (color = colors.black) => createShadow(color, 0.2, 4, 8),
  pronounced: (color = colors.black) => createShadow(color, 0.3, 6, 12),
  elevated: (color = colors.black) => createShadow(color, 0.4, 8, 16),
};

// Typography styles remain the same, just use FONT_FAMILY from platformUtils
export const typography = {
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.2,
    textShadowColor: colors.overlayLight, // Using standardized overlay
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    fontFamily: FONT_FAMILY.bold,
  },
  mainHeading: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    fontFamily: FONT_FAMILY.bold,
  },
  subHeading: {
    fontSize: 15,
    marginTop: 6,
    color: '#555',
    fontFamily: FONT_FAMILY.medium,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    marginTop: 4,
    fontFamily: FONT_FAMILY.medium,
  },
  value: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
    fontFamily: FONT_FAMILY.bold,
  },
  pickerLabel: {
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 15,
    fontFamily: FONT_FAMILY.medium,
  },
};

// Layout
export const layout = {
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 10,
    zIndex: 2,
    minHeight: height,
    paddingBottom: 90, // for tab bar
    // Add padding for Android status bar if not using SafeAreaView
    ...(!IS_IOS && { paddingTop: STATUS_BAR_HEIGHT }),
  },
  safeArea: {
    flex: 1,
    zIndex: 2,
  },
  fullScreen: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.black,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    paddingVertical: 20,
  },
  centeredRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetweenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
};

// Components
export const components = {
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: undefined,
    height: undefined,
    zIndex: 0,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  glass: {
    width: '88%',
    paddingVertical: 30,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(30, 30, 40, 0.25)',
    borderRadius: 24,
    overflow: 'hidden', // Critical for BlurView to respect borderRadius
    alignItems: 'center',
    ...createShadow(colors.black, 0.2, 8, 16),
    ...(IS_IOS && { backdropFilter: 'blur(16px)' }),
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
    overflow: 'hidden', // Critical for BlurView to respect borderRadius
    position: 'relative',
    borderRadius: 24, // Your desired border radius
    backgroundColor: colors.cardHeader,
  },
  formCard: {
    width: '100%',
    maxWidth: 480,
    marginBottom: 18,
    padding: 20,
    borderRadius: 24, // Your desired border radius
    overflow: 'hidden', // Critical for BlurView to respect borderRadius
    backgroundColor: colors.card,
    position: 'relative',
    alignItems: 'center',
    // Add subtle border for better definition
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...shadows.medium(colors.primary), // Using the shadow system
  },
  input: {
    width: '100%',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    // Improve focus state visibility
    shadowColor: colors.primary,
    // Platform-specific adjustments
    ...(!IS_IOS && { 
      underlineColorAndroid: 'transparent',
      padding: 10,
    }),
    fontFamily: FONT_FAMILY.regular,
    textAlignVertical: 'center',
  },
  inputLabel: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 2,
    fontFamily: FONT_FAMILY.medium,
  },
  inputError: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 2,
    fontFamily: FONT_FAMILY.regular,
  },
  // Unified touchable styles
  touchable: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    // Use different effects for different platforms
    ...(IS_IOS ? {
      // iOS will use opacity effect by default
    } : {
      // Android can use ripple effect via TouchableNativeFeedback
      // We don't apply it here since it's applied via the component itself
    }),
  },
  buttonGradient: {
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: FONT_FAMILY.medium,
    // Add subtle text shadow to improve legibility on colored backgrounds
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonOutline: {
    width: '100%',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: colors.buttonOutline,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderRadius: 16,
  },
  buttonOutlineText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: FONT_FAMILY.medium,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: IS_IOS ? 'blur(8px)' : undefined, // Increased blur for better separation
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 420,
    ...shadows.elevated(colors.black), // Using black shadow for better visibility
    borderWidth: 1, // Adding border for better definition
    borderColor: 'rgba(0, 0, 0, 0.1)', // Subtle border
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text, // Using standard text color for consistency
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bold,
  },
  modalContent: {
    width: '100%', 
    paddingVertical: 12,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.white, 
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: FONT_FAMILY.medium,
    letterSpacing: 0.5,
  },
  modalDismissButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    letterSpacing: 1,
    zIndex: 3,
    fontFamily: FONT_FAMILY.regular,
  },
  branchOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.46)',
    marginRight: 8,
  },
  branchOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  submitButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    ...createShadow(colors.primary, 0.2, 4, 8),
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
    fontFamily: FONT_FAMILY.bold,
  },
};

// Camera-related styles
export const camera = {
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Ensure camera appears above everything else
  },
  cameraHeader: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: STATUS_BAR_HEIGHT,
  },
  cameraTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: FONT_FAMILY.bold,
  },
  cameraPreviewContainer: {
    width: '90%',
    height: height * 0.5,
    marginHorizontal: '5%',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 20,
    backgroundColor: colors.black,
    borderWidth: 2,
    borderColor: colors.primary,
    ...createShadow(colors.primary, 0.4, 5, 15),
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraControls: {
    paddingHorizontal: 20,
    paddingBottom: IS_IOS ? 40 : 20, // Extra padding for iOS to account for home indicator
    width: '100%',
  },
  cameraInstructions: {
    color: colors.white,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.regular,
  },
  captureButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    ...createShadow(colors.primary, 0.3, 5, 10),
  },
  captureButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
  },
  closeCameraButton: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    ...createShadow(colors.secondary, 0.3, 4, 8),
  },
  closeCameraText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
  },
};

// Additional domain-specific styles
export const dashboard = {
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 480,
    marginBottom: 10,
    gap: 8,
  },
  card: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 15,
    marginHorizontal: 2,
    marginBottom: 2,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.card,
    ...createShadow(colors.primary, 0.1, 3, 12),
  },
  cardIcon: {
    marginBottom: 8,
    opacity: 0.7,
  },
  cardText: {
    color: colors.black,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.medium,
  },
  avatar: {
    marginBottom: 8,
    opacity: 0.9,
  },
  balance: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 136, 204, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bold,
  },
  balanceLabel: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 2,
    letterSpacing: 1,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.regular,
  },
};

// Filter controls
export const filters = {
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 5,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 1,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
};

// Account-related styles
export const account = {
  accountCard: {
    width: '100%',
    maxWidth: 480,
    marginBottom: 18,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.13)',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'flex-start',
    ...createShadow(colors.primary, 0.1, 3, 12),
  },
  accountNumber: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
    fontFamily: FONT_FAMILY.bold,
  },
  accountType: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 2,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.medium,
  },
  accountBranch: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 2,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.medium,
  },
  accountIFSC: {
    color: colors.textLight,
    fontSize: 15,
    marginBottom: 2,
    fontFamily: FONT_FAMILY.regular,
  },
  accountBalance: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    fontFamily: FONT_FAMILY.bold,
  },
  accountDate: {
    color: colors.textLight,
    fontSize: 13,
    marginTop: 2,
    fontFamily: FONT_FAMILY.regular,
  },
};

// Transaction-related styles
export const transactions = {
  transactionCard: {
    width: '100%',
    maxWidth: 480,
    marginBottom: 18,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.13)',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'flex-start',
    ...createShadow(colors.primary, 0.1, 3, 12),
  },
  txnLabel: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 2,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.medium,
  },
  txnValue: {
    color: colors.primary,
    fontWeight: 'bold',
    fontFamily: FONT_FAMILY.bold,
  },
  txnAmount: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
  },
  refreshButton: {
    marginLeft: 10,
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,136,204,0.15)',
    alignSelf: 'flex-start'
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
};

// Loan-related styles
export const loan = {
  pickerWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  pickerLabel: {
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 15,
    fontFamily: FONT_FAMILY.medium,
  },
  branchOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.46)',
    marginRight: 8,
  },
  branchOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
};

// Exchange Rate styles
export const exchangeRate = {
  pickerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginVertical: 6,
    alignItems: 'center',
    width: '100%',
  },
  pickerButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: FONT_FAMILY.medium,
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
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 8,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.regular,
  },
  convertButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginLeft: 8,
  },
  convertButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
    fontFamily: FONT_FAMILY.bold,
  },
  convertedText: {
    marginTop: 10,
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bold,
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
    borderBottomColor: 'rgba(0,136,204,0.15)',
  },
  currency: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
    fontFamily: FONT_FAMILY.medium,
  },
  rate: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
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
    fontFamily: FONT_FAMILY.bold,
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  modalItemText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: FONT_FAMILY.regular,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.medium,
  },
};

// Complaints-related styles
export const complaints = {
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.66)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: FONT_FAMILY.regular,
  },
  complaintCard: {
    width: '100%',
    maxWidth: 480,
    marginBottom: 18,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.13)',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'flex-start',
    ...createShadow(colors.primary, 0.1, 3, 12),
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 5,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 1,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
};

// User Profile styles
export const profile = {
  avatar: {
    marginBottom: 8,
    opacity: 0.9
  },
  profileCard: {
    width: '100%',
    maxWidth: 480,
    marginBottom: 35,
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.13)',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'flex-start',
    ...createShadow(colors.primary, 0.1, 3, 12),
  },
  logoutButton: {
    position: 'absolute',
    bottom: 92,
    left: 24,
    right: 24,
    backgroundColor: colors.secondary,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
    ...createShadow(colors.secondary, 0.18, 4, 10),
  },
  logoutText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
    fontFamily: FONT_FAMILY.bold,
  }
};

// Transaction styles for UserMakeTransaction
export const transaction = {
  stepIndicator: {
    color: colors.textLight,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.regular,
  },
  optionButton: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  nextButton: {
    width: '48%',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  nextButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
    fontFamily: FONT_FAMILY.bold,
  },
  prevButton: {
    width: '48%',
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  prevButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
    fontFamily: FONT_FAMILY.bold,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bold,
  },
  value: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
    fontFamily: FONT_FAMILY.bold,
  },
  cancelButton: {
    width: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
    fontFamily: FONT_FAMILY.bold,
  },
  // Success modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    color: colors.primary,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bold,
  },
};

// Home screen specific styles
export const home = {
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.black
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: undefined,
    height: undefined,
    zIndex: 0,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  logoContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3
  },
  logo: {
    width: 80,
    height: 80
  },
  glass: {
    width: '88%',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    borderRadius: 24,
    alignItems: 'center',
    ...createShadow(colors.black, 0.2, 8, 16),
    ...(IS_IOS && { backdropFilter: 'blur(16px)' }),
  },
  heading: {
    color: colors.white,
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    fontFamily: FONT_FAMILY.bold,
  },
  subheading: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    marginBottom: 48,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.medium,
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
    gap: 16
  },
  button: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden'
  },
  buttonOutline: {
    width: '100%',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(42, 42, 42, 0.07)',
    borderColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderRadius: 16
  },
  buttonOutlineText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: FONT_FAMILY.medium,
  }
};

// Add interaction state styles for buttons and interactive elements
export const interactionStates = {
  buttonHover: {
    opacity: 0.92,
    backgroundColor: colors.primaryDark,
  },
  buttonActive: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonFocus: {
    borderWidth: 2,
    borderColor: colors.primaryLight,
    // Outline effect for keyboard navigation
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  inputFocus: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  cardHover: {
    ...shadows.pronounced(colors.primary),
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  cardActive: {
    ...shadows.medium(colors.primary),
    transform: [{ scale: 0.99 }],
  },
};

// Login screen styles
export const login = {
  cameraInstructions: {
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.regular,
  },
  cameraPreviewContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  cameraPreview: { 
    flex: 1 
  },
  accountTypeIndicator: {
    backgroundColor: colors.primaryGlass,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  accountTypeText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bold,
  },
};


// Register screen styles
export const register = {
  stepIndicator: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.regular,
  },
  formContainer: {
    width: '100%',
  },
  cameraInstructions: {
    color: colors.white,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.regular,
  },
  cameraPreviewContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    backgroundColor: colors.black,
    borderWidth: 2,
    borderColor: colors.primary,
    ...createShadow(colors.primary, 0.2, 5, 10),
  },
  cameraPreview: {
    flex: 1,
  },
  faceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlayLight,
  },
  faceOverlayText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: colors.overlayDark,
    padding: 10,
    borderRadius: 5,
    fontFamily: FONT_FAMILY.bold,
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumbnailPreview: {
    width: 80,
    height: 80,
  },
  cameraButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  flipButton: {
    backgroundColor: colors.overlayMedium,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  flipButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FONT_FAMILY.medium,
  },
  imagePreviewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.white,
  },
  retakeButton: {
    backgroundColor: colors.overlayMedium,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retakeButtonText: {
    color: colors.white,
    fontFamily: FONT_FAMILY.medium,
  },
};

// Add animation timing presets
export const animations = {
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    // Add Easing function references if needed
  },
};

// Touchable component helper - to create a platform-specific touchable style
export const getTouchableComponent = () => {
  if (!IS_IOS) {
    return require('react-native').TouchableNativeFeedback;
  } else {
    return require('react-native').TouchableOpacity;
  }
};

// Make sure to add register to the default export
export default {
  colors,
  typography,
  layout,
  components,
  camera,
  dashboard,
  filters,
  account,
  transactions,
  loan,
  exchangeRate,
  complaints,
  profile,
  transaction,
  home,
  login,
  register,     
  interactionStates,
  createShadow,
  PLATFORM,
  getTouchableComponent,
  shadows,
  animations,
};