import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } 
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setMessage("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/sign-in");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* <header className="fh5co-header fh5co-cover fh5co-cover-sm" role="banner" 
        style={{backgroundImage: 'url(front_assets/images/img_bg_1.jpg)', position: 'relative'}}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}></div>
        <div className="fh5co-container">
          <div className="row">
            <div className="col-md-8 col-md-offset-2 text-center">
              <div className="display-t">
                <div className="display-tc animate-box" data-animate-effect="fadeIn">
                  <h1>Register Account</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header> */}

      <div className="conn">
        {message && (
          <div
            className={`alert ${
              message.includes("success") ? "alert-success" : "alert-danger"
            }`}
            style={{
              padding: "15px",
              backgroundColor: message.includes("success")
                ? "#dff0d8"
                : "#f8d7da",
              color: message.includes("success") ? "#3c763d" : "#721c24",
              borderRadius: "4px",
              marginBottom: "20px",
              border: `1px solid ${
                message.includes("success") ? "#d6e9c6" : "#f5c6cb"
              }`,
            }}
          >
            {message}
          </div>
        )}

        <div className="container1">
          <div className="title">
            <p>Create Your Account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="user_details">
              <div className="input_box">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Enter your firstname"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                {errors.firstName && (
                  <span className="text-danger text-sm">
                    {errors.firstName}
                  </span>
                )}
              </div>
              <div className="input_box">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Enter your lastname"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                {errors.lastName && (
                  <span className="text-danger text-sm">{errors.lastName}</span>
                )}
              </div>
              <div className="input_box">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && (
                  <span className="text-danger text-sm">{errors.email}</span>
                )}
              </div>
              <div className="input_box">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="number"
                  id="phone"
                  name="phone"
                  placeholder="Enter your number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                {errors.phone && (
                  <span className="text-danger text-sm">{errors.phone}</span>
                )}
              </div>
              <div className="input_box">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && (
                  <span className="text-danger text-sm">{errors.password}</span>
                )}
              </div>
              <div className="input_box">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {errors.confirmPassword && (
                  <span className="text-danger text-sm">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
              <div className="input_box">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
                {errors.dateOfBirth && (
                  <span className="text-danger text-sm">
                    {errors.dateOfBirth}
                  </span>
                )}
              </div>
              <div className="gender">
                <span className="gender_title">Gender</span>
                <input
                  type="radio"
                  name="gender"
                  id="radio_1"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                  required
                />
                <input
                  type="radio"
                  name="gender"
                  id="radio_2"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                  required
                />

                <div className="category">
                  <label htmlFor="radio_1">
                    <span
                      className={`dot ${
                        formData.gender === "male" ? "one active" : "one"
                      }`}
                    ></span>
                    <span style={{ marginRight: "10px" }}>Male</span>
                  </label>
                  <label htmlFor="radio_2">
                    <span
                      className={`dot ${
                        formData.gender === "female" ? "two active" : "two"
                      }`}
                    ></span>
                    <span>Female</span>
                  </label>
                </div>
                {errors.gender && (
                  <span className="text-danger text-sm">{errors.gender}</span>
                )}
              </div>
            </div>

            <div className="reg_btn">
              <button type="submit" className="in" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .conn {
          height: 100%;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f2f2f2;
          flex-direction: column;
          padding: 20px;
        }

        .container1 {
          width: 60%;
          background: #ffffff;
          border-radius: 0.5rem;
          box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.1),
            0px 5px 12px -2px rgba(0, 0, 0, 0.1),
            0px 18px 36px -6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin: 0 auto;
          margin: 10px;
        }

        .container1 .title {
          padding: 25px;
          background: #f6f8fa;
        }

        .container1 .title p {
          font-size: 25px;
          font-weight: 500;
          position: relative;
        }

        .container1 .title p::before {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 30px;
          height: 3px;
          background: #fc8302;
        }

        .user_details {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          padding: 25px;
        }

        .user_details .input_box {
          width: calc(100% / 2 - 20px);
          margin: 0 0 12px 0;
        }

        .input_box label {
          font-weight: 500;
          margin-bottom: 5px;
          display: block;
        }

        .input_box label::after {
          content: " *";
          color: red;
        }

        .input_box input {
          width: 100%;
          height: 45px;
          border: none;
          outline: none;
          border-radius: 5px;
          font-size: 16px;
          padding-left: 15px;
          box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.1);
          background-color: #f6f8fa;
          font-family: "Poppins", sans-serif;
          transition: all 120ms ease-out 0s;
        }

        .input_box input:focus,
        .input_box input:valid {
          box-shadow: 0px 0px 0px 2px #ac8ece;
        }

        form .gender {
          padding: 0px 25px;
          width: 50%;
        }

        .gender .gender_title {
          font-size: 20px;
          font-weight: 500;
        }

        .gender .category {
          width: 80%;
          display: flex;
          margin: 5px 0;
        }

        .gender .category label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .gender .category label .dot {
          height: 18px;
          width: 18px;
          background: #d9d9d9;
          border-radius: 50%;
          margin-right: 10px;
          border: 4px solid transparent;
          transition: all 0.3s ease;
        }

        #radio_1:checked ~ .category label .one,
        #radio_2:checked ~ .category label .two {
          border-color: #d9d9d9;
          background: #fc8302;
        }

        .gender input {
          display: none;
        }

        .reg_btn {
          padding: 25px;
          margin: 15px 0;
        }

        .reg_btn .in {
          height: 45px;
          width: 100%;
          border: none;
          font-size: 18px;
          font-weight: 500;
          cursor: pointer;
          background: #fc8302;
          border-radius: 5px;
          color: #ffffff;
          letter-spacing: 1px;
          text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2);
        }

        .reg_btn .in:hover {
          background: #e67300;
        }

        .text-danger {
          color: #dc3545;
          font-size: 14px;
          margin-top: 5px;
          display: block;
        }

        .in:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }

        @media screen and (max-width: 584px) {
          .user_details {
            max-height: 340px;
            overflow-y: scroll;
          }

          .user_details::-webkit-scrollbar {
            width: 0;
          }

          .user_details .input_box {
            width: 100%;
          }

          .gender .category {
            width: 100%;
          }
        }

        @media screen and (max-width: 419px) {
          .container1 {
            width: 90%;
          }

          .gender .category {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
