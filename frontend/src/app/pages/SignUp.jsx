import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast

export const SignUp = () => {
    const navigate = useNavigate();
    const { signupUser, error: apierror, loading } = useAuthStore();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    // 1. Listen for API errors and show Toast
    useEffect(() => {
        if (apierror) {
            toast.error(apierror);
        }
    }, [apierror]);

    const validateField = (name, value) => {
        let errorMsg = '';
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                errorMsg = 'Please enter a valid email address.';
            }
        } else if (name === 'password') {
            if (value && value.length < 6) {
                errorMsg = 'Password must be at least 6 characters long.';
            }
        }
        return errorMsg;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        const fieldError = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: fieldError }));
    };

    const handleContinue = async () => {
        const emailErr = validateField('email', formData.email);
        const passErr = validateField('password', formData.password);

        if (emailErr || passErr || !formData.email || !formData.password) {
            setErrors({
                email: emailErr || (!formData.email ? 'Email is required' : ''),
                password: passErr || (!formData.password ? 'Password is required' : '')
            });
            return;
        }

        // 2. Call signup and navigate on success
        try {
            await signupUser(formData);
            if (!apierror) {
                toast.success("OTP sent to your email!");
                navigate('/verify-otp');
            }
        } catch (err) {
            // Error handled by useEffect/apierror
        }
    };

    const handleSignUpRedirect = () => {
        navigate('/signin');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-base-300 w-full">
            <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
                <div className="card-body gap-6">
                    <div className="text-start">
                        <h2 className="text-5xl font-bold text-base-content">Sign Up</h2>
                        <p className="text-start text-lg text-base-content/70 mt-4">
                            Already have an account?{" "}
                            <span
                                onClick={handleSignUpRedirect}
                                className="text-blue-500 font-semibold cursor-pointer hover:underline underline-offset-4"
                            >
                                Sign in
                            </span>
                        </p>
                    </div>

                    <button className="btn btn-xl text-lg btn-outline text-base-content/70 flex items-center gap-3 normal-case hover:bg-blue-50 border-base-300">
                        <img src="/images/google.svg" alt="Google" className="w-5 h-5" />
                        Continue with Google
                    </button>

                    <div className="divider text-xs text-base-content/40 uppercase">Or</div>

                    <div className="flex flex-col gap-4">
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full bg-transparent rounded-xl text-xl px-2 border-2 py-3 outline-none transition-colors focus:border-blue-500 placeholder:text-gray-400 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                            />
                            {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
                        </div>
                        <div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full bg-transparent rounded-xl text-xl px-2 border-2 py-3 outline-none transition-colors focus:border-blue-500 placeholder:text-gray-400 ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                            />
                            {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password}</p>}
                        </div>

                        <button
                            onClick={handleContinue}
                            disabled={loading}
                            className={`btn btn-xl w-full mt-4 normal-case text-white shadow-lg 
                                ${loading
                                    ? "bg-gray-400 cursor-not-allowed shadow-none"
                                    : "bg-blue-500 hover:bg-blue-600 shadow-blue-200"
                                } transition-all duration-200`}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <span className="loading loading-spinner loading-sm"></span>
                                    <span>Generating OTP...</span>
                                </div>
                            ) : (
                                <span>Continue</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};