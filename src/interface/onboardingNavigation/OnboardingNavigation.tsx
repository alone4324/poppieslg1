import { useState, useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import useGame from '../../stores/store';
import './style.css';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  target: string;
  spotlightPosition: { x: number; y: number; width: number; height: number };
  action?: () => void;
}

const OnboardingNavigation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [canProceed, setCanProceed] = useState(false);
  const [hasStartedOnboarding, setHasStartedOnboarding] = useState(false);
  const { authenticated } = usePrivy();
  const { setInsufficientFundsPopup } = useGame();
  const overlayRef = useRef<HTMLDivElement>(null);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Connect Your Wallet",
      description: "Click the 'Connect Wallet' button to start your blockchain gaming journey",
      target: ".wallet-widget",
      spotlightPosition: { x: 0, y: 0, width: 0, height: 0 },
      action: () => {
        if (!authenticated) {
          const loginBtn = document.querySelector('.wallet-login-btn') as HTMLButtonElement;
          if (loginBtn) {
            loginBtn.click();
          }
        }
      }
    },
    {
      id: 2,
      title: "Fund Your Wallet",
      description: "You'll need MON tokens to play. Fund your wallet to start spinning!",
      target: ".interface",
      spotlightPosition: { x: 0, y: 0, width: 0, height: 0 },
      action: () => {
        // Open the insufficient funds popup to show funding instructions
        setInsufficientFundsPopup(true);
      }
    },
    {
      id: 3,
      title: "Ready to Play!",
      description: "You're all set! Click 'Get Started' to begin your gaming adventure",
      target: ".slot-machine",
      spotlightPosition: { x: 0, y: 0, width: 0, height: 0 }
    }
  ];

  // Calculate spotlight position based on target element with enhanced sizing
  const updateSpotlightPosition = (targetSelector: string, stepIndex: number) => {
    const targetElement = document.querySelector(targetSelector);
    if (targetElement && overlayRef.current) {
      const rect = targetElement.getBoundingClientRect();
      const overlayRect = overlayRef.current.getBoundingClientRect();
      
      const x = rect.left - overlayRect.left + rect.width / 2;
      const y = rect.top - overlayRect.top + rect.height / 2;
      
      // Enhanced size calculation based on step
      let baseSize = Math.max(rect.width, rect.height);
      let finalSize;
      
      switch (stepIndex) {
        case 0: // Wallet widget
          finalSize = Math.max(baseSize + 120, 280);
          break;
        case 1: // Interface area
          finalSize = Math.max(baseSize + 200, 400);
          break;
        case 2: // Slot machine
          finalSize = Math.max(baseSize + 150, 350);
          break;
        default:
          finalSize = baseSize + 100;
      }
      
      setSpotlightPosition({
        x,
        y,
        width: rect.width + 80,
        height: rect.height + 80
      });

      // Set CSS custom properties for enhanced mask effect
      if (overlayRef.current) {
        overlayRef.current.style.setProperty('--spotlight-x', `${x}px`);
        overlayRef.current.style.setProperty('--spotlight-y', `${y}px`);
        overlayRef.current.style.setProperty('--spotlight-size', `${finalSize}px`);
        overlayRef.current.setAttribute('data-step', stepIndex.toString());
      }
    }
  };

  // Show navigation when wallet is not connected OR when onboarding has started
  useEffect(() => {
    if (!authenticated && !hasStartedOnboarding) {
      setIsVisible(true);
      setCurrentStep(0);
      setCanProceed(false);
    } else if (!authenticated && hasStartedOnboarding) {
      // Keep navigation visible if onboarding was started
      setIsVisible(true);
    } else if (authenticated && hasStartedOnboarding) {
      // Keep navigation visible if wallet connects during onboarding
      setIsVisible(true);
    }
  }, [authenticated, hasStartedOnboarding]);

  // Enable next button when wallet is connected
  useEffect(() => {
    if (currentStep === 0 && authenticated) {
      setCanProceed(true);
    } else if (currentStep > 0) {
      setCanProceed(true);
    }
  }, [authenticated, currentStep]);

  useEffect(() => {
    if (isVisible && currentStep < steps.length) {
      const currentStepData = steps[currentStep];
      updateSpotlightPosition(currentStepData.target, currentStep);
      
      // Update position on window resize
      const handleResize = () => {
        updateSpotlightPosition(currentStepData.target, currentStep);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Also update position periodically to catch dynamic changes
      const interval = setInterval(() => {
        updateSpotlightPosition(currentStepData.target, currentStep);
      }, 1000);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        clearInterval(interval);
      };
    }
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (!canProceed) return; // Prevent proceeding if wallet not connected
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and hide navigation
      setIsVisible(false);
      setHasStartedOnboarding(false);
    }
  };

  const handleSkip = () => {
    // Hide navigation and reset onboarding state
    setIsVisible(false);
    setHasStartedOnboarding(false);
  };

  const handleStepAction = () => {
    const currentStepData = steps[currentStep];
    if (currentStepData.action) {
      currentStepData.action();
    }
    // Mark that onboarding has started
    setHasStartedOnboarding(true);
  };

  // Reset function for testing
  const resetOnboarding = () => {
    setCurrentStep(0);
    setIsVisible(true);
    setCanProceed(false);
    setHasStartedOnboarding(false);
  };

  useEffect(() => {
    (window as any).resetOnboarding = resetOnboarding;
    return () => {
      delete (window as any).resetOnboarding;
    };
  }, []);

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <>
      {/* Enhanced Spotlight Overlay */}
      <div ref={overlayRef} className="onboarding-spotlight-overlay" data-step={currentStep}>
        {/* Enhanced Blurred Background with Multiple Glow Layers */}
        <div className="onboarding-blur-background"></div>
        
        {/* Invisible Spotlight Container */}
        <div 
          className="onboarding-spotlight"
          style={{
            left: `${spotlightPosition.x}px`,
            top: `${spotlightPosition.y}px`,
            width: `${spotlightPosition.width}px`,
            height: `${spotlightPosition.height}px`,
            transform: 'translate(-50%, -50%)'
          }}
        ></div>

        {/* Navigation Card */}
        <div className="onboarding-navigation-card">
          <div className="navigation-header">
            <div className="step-progress">
              <div className="step-dots">
                {steps.map((_, index) => (
                  <div 
                    key={index}
                    className={`step-dot ${index <= currentStep ? 'active' : ''}`}
                  ></div>
                ))}
              </div>
              <span className="step-counter">
                {currentStep + 1} of {steps.length}
              </span>
            </div>
            <button className="skip-button" onClick={handleSkip}>
              Skip
            </button>
          </div>

          <div className="navigation-content">
            <h2 className="step-title">{currentStepData.title}</h2>
            <p className="step-description">{currentStepData.description}</p>
          </div>

          <div className="navigation-actions">
            {currentStepData.action && (
              <button 
                className="action-button primary"
                onClick={handleStepAction}
              >
                {currentStep === 0 ? 'Connect Wallet' : 
                 currentStep === 1 ? 'Fund Wallet' : 'Continue'}
              </button>
            )}
            <button 
              className={`action-button secondary ${!canProceed ? 'disabled' : ''}`}
              onClick={handleNext}
              disabled={!canProceed}
            >
              {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingNavigation;