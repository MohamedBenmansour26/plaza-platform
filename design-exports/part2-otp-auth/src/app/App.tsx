import { useState } from 'react';
import PhoneEntry from './components/PhoneEntry';
import OTPVerification from './components/OTPVerification';
import PINSetup from './components/PINSetup';
import DailyLogin from './components/DailyLogin';
import ForgotPIN from './components/ForgotPIN';
import PhoneRecovery from './components/PhoneRecovery';

type Screen = 'phone-entry' | 'otp-verification' | 'pin-setup' | 'daily-login' | 'forgot-pin' | 'phone-recovery';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('phone-entry');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userPin, setUserPin] = useState('');
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [merchantName, setMerchantName] = useState('Fatima Store');

  const handlePhoneSubmit = (phone: string) => {
    setPhoneNumber(phone);
    setCurrentScreen('otp-verification');
  };

  const handleOTPVerified = () => {
    if (isReturningUser) {
      setCurrentScreen('daily-login');
    } else {
      setCurrentScreen('pin-setup');
    }
  };

  const handlePINSetupComplete = (pin: string) => {
    setUserPin(pin);
    setMerchantName('Plaza Store');
    setIsReturningUser(true);
    setCurrentScreen('daily-login');
  };

  const handleLoginSuccess = () => {
    console.log('Login successful!');
  };

  const handleForgotPIN = () => {
    setCurrentScreen('forgot-pin');
  };

  const handleForgotPINSendOTP = () => {
    setCurrentScreen('otp-verification');
  };

  const handlePhoneRecovery = () => {
    setCurrentScreen('phone-recovery');
  };

  const handleBack = () => {
    if (currentScreen === 'otp-verification') {
      setCurrentScreen('phone-entry');
    } else if (currentScreen === 'forgot-pin') {
      setCurrentScreen('daily-login');
    } else if (currentScreen === 'phone-recovery') {
      setCurrentScreen('forgot-pin');
    }
  };

  const maskPhone = (phone: string) => {
    if (phone.length >= 4) {
      const lastTwo = phone.slice(-2);
      return `+212 6•• •• •• ${lastTwo}`;
    }
    return '+212 6•• •• •• ••';
  };

  return (
    <div className="size-full bg-[#FAFAF9]">
      {currentScreen === 'phone-entry' && (
        <PhoneEntry onSubmit={handlePhoneSubmit} />
      )}
      {currentScreen === 'otp-verification' && (
        <OTPVerification
          phoneNumber={maskPhone(phoneNumber)}
          onVerified={handleOTPVerified}
          onBack={handleBack}
        />
      )}
      {currentScreen === 'pin-setup' && (
        <PINSetup onComplete={handlePINSetupComplete} />
      )}
      {currentScreen === 'daily-login' && (
        <DailyLogin
          merchantName={merchantName}
          phoneNumber={maskPhone(phoneNumber)}
          onLoginSuccess={handleLoginSuccess}
          onForgotPIN={handleForgotPIN}
        />
      )}
      {currentScreen === 'forgot-pin' && (
        <ForgotPIN
          phoneNumber={maskPhone(phoneNumber)}
          onSendOTP={handleForgotPINSendOTP}
          onPhoneRecovery={handlePhoneRecovery}
          onBack={handleBack}
        />
      )}
      {currentScreen === 'phone-recovery' && (
        <PhoneRecovery onBack={handleBack} />
      )}
    </div>
  );
}