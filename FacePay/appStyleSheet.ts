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

// Colors
export const colors = {
  primary: '#00abe9',
  primaryDark: '#0091c7',
  primaryLight: 'rgba(0, 171, 233, 0.08)',
  secondary: '#e53935',
  secondaryDark: '#c62828',
  text: '#222',
  textLight: '#666',
  white: '#fff',
  black: '#000',
  error: 'red',
  success: '#4CAF50',
  transparent: 'transparent',
  card: 'rgba(255, 255, 255, 0.13)',
  cardHeader: 'rgba(255, 255, 255, 0.08)',
  buttonOutline: 'rgba(255, 255, 255, 0.08)',
  inputBg: 'rgba(255, 255, 255, 0.66)',
  inputBorder: 'rgba(0, 110, 157, 0.42)',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
};

// Re-export the createShadow function from platformUtils
export { createShadow };

// Typography styles remain the same, just use FONT_FAMILY from platformUtils
export const typography = {
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
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
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    ...createShadow(colors.primary, 0.1, 3, 12),
  },
  input: {
    width: '100%',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    // Remove default underline on Android
    ...(!IS_IOS && { 
      underlineColorAndroid: 'transparent',
      padding: 10,  // Android needs more padding
    }),
    // Match text layout across platforms
    fontFamily: FONT_FAMILY.regular,
    textAlignVertical: 'center',
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
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
    ...createShadow('#000', 0.2, 8, 16),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    fontFamily: FONT_FAMILY.bold,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
    fontFamily: FONT_FAMILY.regular,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.medium,
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
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPreviewContainer: {
    width: '90%',
    maxWidth: 480,
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    backgroundColor: colors.black,
  },
  cameraPreview: {
    flex: 1,
  },
  cameraInstructions: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.regular,
  },
  captureButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
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
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 10,
    ...createShadow(colors.secondary, 0.3, 4, 8),
  },
  closeCameraText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retakeButtonText: {
    color: colors.white,
    fontFamily: FONT_FAMILY.medium,
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
    textShadowColor: 'rgba(0, 171, 233, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bold,
  },
  balanceLabel: {
    color: 'rgba(25, 25, 25, 0.7)',
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
    backgroundColor: 'rgba(0,171,233,0.08)',
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

// Touchable component helper - to create a platform-specific touchable style
export const getTouchableComponent = () => {
  if (!IS_IOS) {
    return require('react-native').TouchableNativeFeedback;
  } else {
    return require('react-native').TouchableOpacity;
  }
};

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
  createShadow,
  PLATFORM,
  getTouchableComponent,
};