import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SignIn = () => {
    const navigate = useNavigate();

    const handleSignUpRedirect = () => {
        navigate('/signup');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-base-300 w-full">
            <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
                <div className="card-body gap-6">
                    {/* Header */}
                    <div className="text-start">
                        <h2 className="text-5xl font-bold text-base-content">Sign In</h2>
                        {/* Footer Toggle */}
                        <p className="text-start text-lg text-base-content/70 mt-4">
                            Don't have an account?{" "}
                            <span
                                onClick={handleSignUpRedirect}
                                className="text-blue-500 font-semibold cursor-pointer hover:underline underline-offset-4"
                            >
                                Sign up
                            </span>
                        </p>                    </div>

                    {/* Google Login Option */}
                    <button className="btn btn-xl text-lg btn-outline text-base-content/70 flex items-center gap-3 normal-case hover:bg-blue-50 border-base-300">
                        <img src="/images/google.svg" alt="Google" className="w-5 h-5" />
                        Continue with Google
                    </button>

                    <div className="divider text-xs text-base-content/40 uppercase">Or</div>

                    {/* Form Fields */}
                    <div className="flex flex-col gap-6">
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-transparent rounded-xl text-xl px-2 border-2 border-gray-200 py-3 outline-none transition-colors focus:border-blue-500 placeholder:text-gray-400"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-transparent rounded-xl text-xl px-2 border-2 border-gray-200 py-3 outline-none transition-colors focus:border-blue-500 placeholder:text-gray-400"
                        />

                        <button className="btn btn-xl w-full bg-blue-500 w-full mt-4 normal-case text-white shadow-lg shadow-blue-200">
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};