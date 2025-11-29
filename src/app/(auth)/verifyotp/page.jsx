"use client";
import registration_img from "../../../../public/login_page_image.png";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useVerifyResetOtpMutation } from "@/lib/features/auth/authApi";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const VerfiyOtp = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);
  const router = useRouter();
  

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const userEmail = user?.email;
  
  const [verifyResetOtp, { isLoading, isError, error, isSuccess }] = useVerifyResetOtpMutation();
  

  console.log("verifyResetOtp function:", verifyResetOtp)




  useEffect(() => {
    console.log("Logged in user:", user);
    console.log("User email:", userEmail);
    console.log("Is authenticated:", isAuthenticated);
  }, [user, userEmail, isAuthenticated]);

  useEffect(() => {
    // auto-focus first input when component mounts
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 50);
  }, []);

  const handleKeyDown = (e) => {
    if (
      !/^[0-9]{1}$/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "Tab" &&
      !e.metaKey
    ) {
      e.preventDefault();
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      const index = inputRefs.current.indexOf(e.target);
      // clear current box and move focus to previous
      e.preventDefault();
      setOtp((prev) => {
        const copy = [...prev];
        if (index >= 0) copy[index] = "";
        return copy;
      });
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleInput = (e) => {
    const { target } = e;
    const index = inputRefs.current.indexOf(target);
    const val = target.value.replace(/[^0-9]/g, "");
    if (!val) return;
    const char = val.slice(-1);
    setOtp((prev) => {
      const copy = [...prev];
      copy[index] = char;
      return copy;
    });
    if (index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const digitsOnly = text.replace(/[^0-9]/g, "");
    // allow pasting longer strings but only take first N digits
    if (!/^[0-9]+$/.test(digitsOnly)) return;
    const digits = digitsOnly.slice(0, otp.length).split("");
    setOtp((prev) => {
      const copy = [...prev];
      for (let i = 0; i < digits.length; i++) copy[i] = digits[i];
      return copy;
    });
    // focus after the last pasted digit
    const nextIndex = Math.min(digits.length, otp.length - 1);
    setTimeout(() => inputRefs.current[nextIndex]?.focus(), 50);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated and has email
    if (!isAuthenticated || !userEmail) {
      toast.error("User not authenticated. Please login again.", {
        style: {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          borderLeft: "6px solid #dc2626",
        },
      });
      return;
    }

    const resetCode = otp.join("");
    

    
    try {
      const result = await verifyResetOtp({
        email: userEmail, // Use logged in user's email
        resetCode: resetCode
      }).unwrap();
      
      toast.success("OTP verified successfully!", {
        style: {
          backgroundColor: "#d1fae5",
          color: "#065f46",
          borderLeft: "6px solid #10b981",
        },
      });
      
      // router.push("/reset-password");
      
    } catch (err) {
      console.error("Failed to verify OTP:", err);
      toast.error(err?.data?.message || "Invalid OTP. Please try again.", {
        style: {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          borderLeft: "6px solid #dc2626",
        },
      });
    }
  };

  return (
    <section className="">
      <div className="max-w-[1100px] mx-auto h-[1200px] flex items-center justify-center max-h-screen">
        <div className="flex items-center justify-center gap-8 bg-[#F8FAFC] rounded-sm overflow-clip md:shadow-2xl">
          {/* Left Side - Images */}
          <div className="hidden md:block overflow-hidden w-full h-full">
            <div className="w-auto">
              <Image
                src={registration_img}
                alt="Worker"
                className="w-full object-cover"
              />
            </div>
          </div>

          {/* Right Side - Role Selection */}
          <div className="flex w-full items-center">
            <div>
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-full">
                  <div className="p-6 sm:p-8">
                    <h1 className="text-[#394352] text-3xl font-semibold my-4">
                      Verify your OTP
                    </h1>
                    <p className="text-[#1F2937]">
                      Please enter the code we've sent to your phone number
                      {userEmail && (
                        <span className="block text-sm text-gray-600 mt-1">
                          (Verifying for: {userEmail})
                        </span>
                      )}
                    </p>

             

                    {/* -------------------form------------------------------ */}
                    <div className="flex flex-col items-center justify-center py-6">
                      <form id="otp-form" className="flex gap-3" onSubmit={handleVerify}>
                        {otp.map((digit, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <label htmlFor={`otp-${index}`} className="sr-only">Digit {index + 1}</label>
                            <input
                              id={`otp-${index}`}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              type="text"
                              maxLength={1}
                              value={digit}
                              onChange={handleInput}
                              onKeyDown={handleKeyDown}
                              onFocus={handleFocus}
                              onPaste={handlePaste}
                              ref={(el) => (inputRefs.current[index] = el)}
                              className="w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl sm:text-3xl rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#115E59] transition"
                              aria-label={`OTP digit ${index + 1}`}
                            />
                          </div>
                        ))}
                      </form>

                      <p className="text-sm text-gray-500 mt-3">Didn't receive a code? <button type="button" className="text-[#115E59] underline ml-1">Resend</button></p>
                    </div>

                    <div className="mt-4 flex w-full text-center rounded-sm overflow-clip transition transform duration-300 hover:scale-101">
                      <button
                        onClick={handleVerify}
                        disabled={isLoading || otp.some(digit => digit === "") || !isAuthenticated}
                        className="bg-[#115E59] w-full py-2 text-white cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Verifying..." : "Verify"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerfiyOtp;