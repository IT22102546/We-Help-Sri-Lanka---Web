// AdminSignIn.js (updated)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signInSuccess, signOut } from "../redux/user/userSlice";
import logo from '../assets/Logo/logowhite.png';

export default function AdminSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const authResponse = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        throw new Error(authData.message || "Login failed");
      }

      // Dispatch to Redux store
      dispatch(
        signInSuccess({
          token: authData.token,
          user: authData.user,
          status: authData.user.status, // superAdmin or admin
          permissions: authData.user.permissions || [],
        })
      );

      // Store in localStorage
      localStorage.setItem("token", authData.token);
      localStorage.setItem("user", JSON.stringify(authData.user));
      localStorage.setItem("status", authData.user.status);
      localStorage.setItem("permissions", JSON.stringify(authData.user.permissions || []));

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      // Clear all auth data on error
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("status");
      localStorage.removeItem("permissions");
      dispatch(signOut());

      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative w-full h-40">
        <div className="absolute inset-0 bg-yellow-200 flex items-center justify-center">
          <img
            src={logo}
            alt="Logo"
            className="h-14 absolute top-10"
          />
        </div>
        <div className="absolute top-[350px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold font-workSans text-gray-900">
              We Help Sri Lanka - Admin Portal
            </h2>
            <p className="mt-2 text-sm text-gray-600 font-workSans">
              Please enter your admin credentials
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-workSans text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-200 focus:border-blue-500"
                  placeholder="admin@wehelpsrilanka.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-workSans text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-200 focus:border-blue-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-workSans text-black bg-yellow-200 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex justify-center items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Forgot password? Contact administrator.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <a href="/" className="text-yellow-600 hover:text-yellow-700">
                Back to main website
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}