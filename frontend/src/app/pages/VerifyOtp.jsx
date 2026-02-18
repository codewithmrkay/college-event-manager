import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import toast, { Toaster } from 'react-hot-toast';

export const VerifyOtp = () => {
  const navigate = useNavigate();
  // Destructuring email along with the actions
  const { verifyEmail, resendOtp, message, loading, error: apierror, email } = useAuthStore();

  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (apierror) toast.error(apierror);
  }, [apierror]);


  const handleChange = (index, value) => {
    console.log(email)
    if (isNaN(value)) return;
    const newOtp = [...otpArray];
    newOtp[index] = value.substring(value.length - 1);
    setOtpArray(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtpString = otpArray.join("");

    if (fullOtpString.length < 6) {
      return toast.error("Please enter the 6-digit OTP");
    }

    if (!email) {
      return toast.error("Email not found. Please sign up again.");
    }

    try {
      // Sending the exact body structure: { email, otp }
      const requestBody = {
        email: email,
        otp: fullOtpString
      };

      await verifyEmail(requestBody);

      toast.success("Verification Successful!");
      navigate('/profile');
    } catch (err) {
      // Error handled by store/useEffect
    }
  };

  const handleResend = async () => {
    try {
      // Sending email for resend if your API needs it
      await resendOtp({ email });
      setTimer(60);
      toast.success("New OTP sent!");
    } catch (err) {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-base-300 w-full">
      <Toaster position="top-center" />
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body gap-6 text-center">
          <div>
            <h2 className="text-4xl font-bold text-base-content">Verify OTP</h2>
            <p className="text-base-content/70 mt-2">Check <b>{email}</b> for the code.</p>
          </div>

          <form onSubmit={handleVerify} className="flex flex-col gap-6">
            <div className="flex justify-between gap-2">
              {otpArray.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl border-gray-200 focus:border-blue-500 outline-none transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              // Disable if loading OR if any of the 6 boxes are empty
              disabled={loading || otpArray.some(digit => digit === "")}
              className={`btn btn-xl w-full mt-4 normal-case text-white shadow-lg transition-all duration-200 border-none
        ${(loading || otpArray.some(digit => digit === ""))
                  ? "bg-gray-400 cursor-not-allowed shadow-none"
                  : "bg-blue-500 hover:bg-blue-600 shadow-blue-200"
                }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Verifying...</span>
                </div>
              ) : (
                <span>Verify OTP</span>
              )}
            </button>
          </form>

          <div className="mt-2 flex gap-4 w-full items-center justify-center">
            <button
              onClick={handleResend}
              disabled={timer > 0 || loading}
              className={`font-semibold cursor-pointer ${timer > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-500 hover:underline"
                }`}
            >
              {timer > 0 ? `Resend code in ${timer}s` : "Resend OTP"}
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-500 font-semibold cursor-pointer hover:underline underline-offset-4"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};