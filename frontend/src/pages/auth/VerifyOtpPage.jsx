import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Lock, RotateCcw, ArrowLeft, CheckCircle, Shield } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import "./VerifyOtpPage.css";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const autoVerifyTriggered = useRef(false);
  const identifier = location.state?.identifier || "";
  const displayOtp = location.state?.otp || "";

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    const isComplete = otp.every((digit) => digit !== "");
    if (isComplete && !isLoading && !isVerified && !autoVerifyTriggered.current) {
      autoVerifyTriggered.current = true;
      handleVerify();
    }
    if (!isComplete) {
      autoVerifyTriggered.current = false;
    }
  }, [otp, isLoading, isVerified]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handlePaste(e);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      const newOtp = [...otp];

      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });

      setOtp(newOtp);

      const lastIndex = Math.min(5, digits.length - 1);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      inputRefs.current.forEach(ref => {
        ref?.parentElement?.classList.add("shake");
        setTimeout(() => {
          ref?.parentElement?.classList.remove("shake");
        }, 500);
      });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await verifyOtp({ email: identifier, code: otpString });
      setIsVerified(true);
      setTimeout(() => {
        navigate("/auth/login");
      }, 1200);
    } catch (err) {
      setError(err.message || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      autoVerifyTriggered.current = false;
      inputRefs.current[0]?.focus();
      inputRefs.current.forEach(ref => {
        ref?.parentElement?.classList.add("error");
        setTimeout(() => {
          ref?.parentElement?.classList.remove("error");
        }, 1000);
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;

    setTimer(30);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    autoVerifyTriggered.current = false;
    inputRefs.current[0]?.focus();

    console.log("OTP resent to your number/email");
  };

  return (
    <div className="otp-page-container">
      <div className="otp-hero-section">
        <button
          className="otp-back-btn"
          onClick={() => navigate("/auth/login")}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="otp-header">
          <div className="otp-icon-wrapper">
            {isVerified ? (
              <CheckCircle size={64} className="otp-icon verified" />
            ) : (
              <Lock size={64} className={`otp-icon ${isLoading ? "loading" : ""}`} />
            )}
          </div>



          <h1 className="otp-title">
            Verify Your Identity
          </h1>

          <p className="otp-subtitle">
            Enter the 6-digit verification code sent to
            <span className="phone-number"> {identifier || "your email"}</span>
          </p>
        </div>

        <div className="otp-input-section">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <div key={index} className="otp-digit-container">
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading || isVerified}
                  className={`otp-digit ${digit ? "filled" : ""}`}
                  aria-label={`Digit ${index + 1}`}
                />
                <div className="digit-underline"></div>
              </div>
            ))}
          </div>
          {displayOtp && (
            <div className="otp-helper">
              Demo OTP: <strong>{displayOtp}</strong>
            </div>
          )}
          {error && <div className="otp-error">{error}</div>}

          <div className="timer-section">
            {!canResend ? (
              <p className="timer">
                Resend code in <span className="time">{timer}s</span>
              </p>
            ) : (
              <button
                className="resend-btn"
                onClick={handleResendOtp}
                disabled={isLoading}
              >
                <RotateCcw size={16} />
                Resend Code
              </button>
            )}
          </div>
        </div>

        <div className="otp-actions">
          <button
            className={`btn-primary otp-verify-btn ${isLoading ? "loading" : ""} ${isVerified ? "verified" : ""}`}
            onClick={handleVerify}
            disabled={isLoading || isVerified}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Verifying...
              </>
            ) : isVerified ? (
              <>
                <CheckCircle size={20} />
                Verified! Redirecting...
              </>
            ) : (
              "Verify & Continue"
            )}
          </button>
        </div>

        <div className="otp-footer">
          <div className="hint-box">
            <p className="hint-title">Quick Tip</p>
            <p className="hint-text">
              For demo purposes, you can use: <code>123456</code> or <code>000000</code>
            </p>
            <p className="hint-subtext">
              Press <kbd>Ctrl+V</kbd> to paste the code faster
            </p>
          </div>


        </div>
      </div>
    </div>
  );
}
