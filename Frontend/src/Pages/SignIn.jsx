import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    dispatch(signInStart());

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      dispatch(signInSuccess(data));
      localStorage.setItem("authToken", data.token);
      navigate("/customer-profile");
    } catch (error) {
      dispatch(signInFailure(error.message));
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="signin-container">
      {/* <header className="fh5co-header fh5co-cover fh5co-cover-sm" role="banner" 
        style={{
          backgroundImage: 'url(front_assets/images/img_bg_1.jpg)',
          backgroundSize: 'cover',
          position: 'relative',
          padding: '100px 0'
        }}>
        <div className="overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}></div>
        <div className="fh5co-container" style={{position: 'relative', zIndex: 1, color: 'white'}}>
          <div className="row">
            <div className="col-md-8 col-md-offset-2 text-center">
              <div className="display-t">
                <div className="display-tc animate-box" data-animate-effect="fadeIn">
                  <h1 style={{fontSize: '3rem', margin: 0}}>Login</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header> */}

      <div
        className="session"
        style={{
          display: "flex",
          flexDirection: "row",
          width: "auto",
          maxWidth: "800px",
          height: "auto",
          margin: "50px auto",
          background: "#ffffff",
          borderRadius: "4px",
          boxShadow: "0px 2px 6px -1px rgba(0, 0, 0, 0.12)",
        }}
      >
        <div
          className="left"
          style={{
            width: "300px",
            height: "auto",
            minHeight: "400px",
            position: "relative",
            backgroundImage:
              "url(https://symphonyevents.com.au/wp-content/uploads/2021/08/Destination-Wedding-06-1.jpg)",
            backgroundSize: "cover",
            borderTopLeftRadius: "4px",
            borderBottomLeftRadius: "4px",
          }}
        >
          <svg
            enableBackground="new 0 0 300 302.5"
            version="1.1"
            viewBox="0 0 300 302.5"
            xmlSpace="preserve"
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: "40px", width: "auto", margin: "20px" }}
          >
            <path
              className="st01"
              d="m126 302.2c-2.3 0.7-5.7 0.2-7.7-1.2l-105-71.6c-2-1.3-3.7-4.4-3.9-6.7l-9.4-126.7c-0.2-2.4 1.1-5.6 2.8-7.2l93.2-86.4c1.7-1.6 5.1-2.6 7.4-2.3l125.6 18.9c2.3 0.4 5.2 2.3 6.4 4.4l63.5 110.1c1.2 2 1.4 5.5 0.6 7.7l-46.4 118.3c-0.9 2.2-3.4 4.6-5.7 5.3l-121.4 37.4zm63.4-102.7c2.3-0.7 4.8-3.1 5.7-5.3l19.9-50.8c0.9-2.2 0.6-5.7-0.6-7.7l-27.3-47.3c-1.2-2-4.1-4-6.4-4.4l-53.9-8c-2.3-0.4-5.7 0.7-7.4 2.3l-40 37.1c-1.7 1.6-3 4.9-2.8 7.2l4.1 54.4c0.2 2.4 1.9 5.4 3.9 6.7l45.1 30.8c2 1.3 5.4 1.9 7.7 1.2l52-16.2z"
              fill="#fff"
            />
          </svg>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
          style={{
            padding: "40px 30px",
            background: "#fefefe",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            paddingBottom: "20px",
            width: "500px",
            boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
          }}
        >
          <h4
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "rgba(0, 0, 0, 0.5)",
              marginBottom: "20px",
            }}
          >
            We are{" "}
            <span style={{ color: "black", fontWeight: 700 }}>
              Viwahaa Matrimony
            </span>
          </h4>
          <p
            style={{
              lineHeight: "155%",
              marginBottom: "5px",
              fontSize: "14px",
              color: "#000",
              opacity: 0.65,
              fontWeight: 400,
              maxWidth: "200px",
              marginBottom: "40px",
            }}
          >
            Welcome back! Log in to your account
          </p>

          <div
            className="floating-label"
            style={{
              position: "relative",
              marginBottom: "10px",
              width: "100%",
            }}
          >
            <input
              placeholder="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "calc(100% - 44px)",
                marginLeft: "auto",
                display: "flex",
                fontSize: "16px",
                padding: "20px 0px",
                height: "56px",
                border: "none",
                borderBottom: "solid 1px rgba(0, 0, 0, 0.1)",
                background: "#fff",
                boxSizing: "border-box",
                transition: "all 0.3s linear",
                color: "#000",
                fontWeight: 400,
                WebkitAppearance: "none",
              }}
            />
            <label
              style={{
                position: "absolute",
                top: "calc(50% - 7px)",
                left: 0,
                opacity: 0,
                transition: "all 0.3s ease",
                paddingLeft: "44px",
                fontSize: "12.5px",
                color: "#000",
                opacity: 0.8,
                fontWeight: 400,
              }}
            ></label>
            <div
              className="icon"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "56px",
                width: "44px",
                display: "flex",
              }}
            >
              <svg
                enableBackground="new 0 0 100 100"
                version="1.1"
                viewBox="0 0 100 100"
                xmlSpace="preserve"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  height: "30px",
                  width: "30px",
                  margin: "auto",
                  opacity: 0.15,
                  transition: "all 0.3s ease",
                }}
              >
                <g transform="translate(0 -952.36)">
                  <path d="m17.5 977c-1.3 0-2.4 1.1-2.4 2.4v45.9c0 1.3 1.1 2.4 2.4 2.4h64.9c1.3 0 2.4-1.1 2.4-2.4v-45.9c0-1.3-1.1-2.4-2.4-2.4h-64.9zm2.4 4.8h60.2v1.2l-30.1 22-30.1-22v-1.2zm0 7l28.7 21c0.8 0.6 2 0.6 2.8 0l28.7-21v34.1h-60.2v-34.1z" />
                </g>
              </svg>
            </div>
          </div>

          <div
            className="floating-label"
            style={{
              position: "relative",
              marginBottom: "10px",
              width: "100%",
            }}
          >
            <input
              placeholder="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: "calc(100% - 44px)",
                marginLeft: "auto",
                display: "flex",
                fontSize: "16px",
                padding: "20px 0px",
                height: "56px",
                border: "none",
                borderBottom: "solid 1px rgba(0, 0, 0, 0.1)",
                background: "#fff",
                boxSizing: "border-box",
                transition: "all 0.3s linear",
                color: "#000",
                fontWeight: 400,
                WebkitAppearance: "none",
              }}
            />
            <label
              style={{
                position: "absolute",
                top: "calc(50% - 7px)",
                left: 0,
                opacity: 0,
                transition: "all 0.3s ease",
                paddingLeft: "44px",
                fontSize: "12.5px",
                color: "#000",
                opacity: 0.8,
                fontWeight: 400,
              }}
            ></label>
            <div
              className="icon"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "56px",
                width: "44px",
                display: "flex",
              }}
            >
              <svg
                enableBackground="new 0 0 24 24"
                version="1.1"
                viewBox="0 0 24 24"
                xmlSpace="preserve"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  height: "30px",
                  width: "30px",
                  margin: "auto",
                  opacity: 0.15,
                  transition: "all 0.3s ease",
                }}
              >
                <path d="M19,21H5V9h14V21z M6,20h12V10H6V20z" />
                <path d="M16.5,10h-1V7c0-1.9-1.6-3.5-3.5-3.5S8.5,5.1,8.5,7v3h-1V7c0-2.5,2-4.5,4.5-4.5s4.5,2,4.5,4.5V10z" />
                <path d="m12 16.5c-0.8 0-1.5-0.7-1.5-1.5s0.7-1.5 1.5-1.5 1.5 0.7 1.5 1.5-0.7 1.5-1.5 1.5zm0-2c-0.3 0-0.5 0.2-0.5 0.5s0.2 0.5 0.5 0.5 0.5-0.2 0.5-0.5-0.2-0.5-0.5-0.5z" />
              </svg>
            </div>
          </div>

          {errorMessage && (
            <div
              className="error-message"
              style={{
                color: "red",
                fontSize: "14px",
                marginTop: "5px",
                width: "100%",
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            style={{
              WebkitAppearance: "none",
              width: "auto",
              minWidth: "100px",
              borderRadius: "24px",
              textAlign: "center",
              padding: "15px 40px",
              marginTop: "5px",
              backgroundColor: "#fc8302",
              color: "#fff",
              fontSize: "14px",
              marginLeft: "auto",
              fontWeight: 500,
              boxShadow: "0px 2px 6px -1px rgba(0, 0, 0, 0.13)",
              border: "none",
              transition: "all 0.3s ease",
              outline: 0,
              cursor: "pointer",
            }}
          >
            Log in
          </button>
          <a
            href="/sign-up"
            className="discrete"
            style={{
              color: "rgba(0, 0, 0, 0.4)",
              fontSize: "14px",
              borderBottom: "solid 1px rgba(0, 0, 0, 0)",
              paddingBottom: "4px",
              marginLeft: "auto",
              fontWeight: 300,
              transition: "all 0.3s ease",
              marginTop: "40px",
              textDecoration: "none",
            }}
          >
            Register
          </a>
        </form>
      </div>

      <style>{`
        .signin-container {
          font-family: 'Poppins', sans-serif;
        }
        
        input:focus {
          border-bottom: solid 1px #e6d79d !important;
          outline: 0;
          box-shadow: 0 2px 6px -8px rgba(230, 212, 157, 0.45) !important;
        }
        
        input:not(:placeholder-shown) {
          padding: 28px 0px 12px 0px !important;
        }
        
        input:not(:placeholder-shown) + label {
          transform: translateY(-10px);
          opacity: 0.7 !important;
        }
        
        .icon svg {
          opacity: 0.15;
          transition: all 0.3s ease;
        }
        
        input:valid:not(:placeholder-shown) + label + .icon svg {
          opacity: 1 !important;
        }
        
        input:valid:not(:placeholder-shown) + label + .icon svg path {
          fill: #e6cc9d !important;
        }
        
        input:not(:valid):not(:focus) + label + .icon {
          animation-name: shake-shake;
          animation-duration: 0.3s;
        }
        
        @keyframes shake-shake {
          0% { transform: translateX(-3px); }
          20% { transform: translateX(3px); }
          40% { transform: translateX(-3px); }
          60% { transform: translateX(3px); }
          80% { transform: translateX(-3px); }
          100% { transform: translateX(0px); }
        }
        
        .login-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 2px 6px -1px rgba(219, 225, 138, 0.65) !important;
        }
        
        .login-button:hover:active {
          transform: scale(0.99);
        }
        
        .discrete:hover {
          border-bottom: solid 1px rgba(0, 0, 0, 0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default SignIn;
