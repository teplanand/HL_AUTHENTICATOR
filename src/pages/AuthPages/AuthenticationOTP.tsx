// AuthenticationOTP.tsx
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import styled from "@emotion/styled";
import {
  useVerifyOtpMutation,
  useSendOtpMutation,
} from "./api/login";
import {
  extractAuthRoles,
  extractRefreshSession,
  extractAuthToken,
  extractAuthUserProfile,
  setStoredAuthRoles,
  setStoredRefreshSession,
  setStoredUserProfile,
  setToken as setTokenV2,
} from "../../../shared/utils/auth";
import { setToken } from "../../../shared/redux/authSlice";
import { AppDispatch, RootState } from "../../../shared/redux/store";

const OTPInput = styled.input`
  width: 3rem;
  height: 3rem;
  text-align: center;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1.125rem;

  &:focus {
    outline: none;
    border-color: #F37440;
    box-shadow: 0 0 0 2px rgba(243, 116, 64, 0.2);
  }

  .dark & {
    background-color: #1f2937;
    border-color: #374151;
    color: white;
  }
`;

const ResendButton = styled.button<{ disabled: boolean }>`
  font-weight: bold;
  color: ${(props) => (props.disabled ? "#9ca3af" : "#F37440")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  background: none;
  border: none;
  padding: 0;

  &:hover:not(:disabled) {
    color: #B84A1C;
    text-decoration: underline;
  }
`;

const LoginContainer = styled.div`
  position: relative;
  min-height: 100vh;
`;

const BackgroundImage = styled.img`
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
`;

const MainContainer = styled.div`
  position: relative;
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-image: url("/assets/images/auth/map.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 2.5rem 1.5rem;

  @media (min-width: 640px) {
    padding-left: 4rem;
    padding-right: 4rem;
  }
`;

const ContentCard = styled.div<{ theme?: string }>`
  position: relative;
  display: flex;
  width: 100%;
  max-width: 1502px;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  border-radius: 0.375rem;
  background: ${(props) =>
    props.theme === "dark" ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.6)"};
  backdrop-filter: blur(20px);

  @media (min-width: 1024px) {
    flex-direction: row;
    gap: 2.5rem;
    min-height: 758px;
  }
`;

const LeftPanel = styled.div`
  position: relative;
  display: none;
  width: 100%;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    225deg,
    rgba(243, 116, 64, 1) 0%,
    rgba(243, 116, 64, 0.9) 100%
  );
  padding: 1.25rem;

  @media (min-width: 1024px) {
    display: inline-flex;
    max-width: 835px;
  }
`;

const RightPanel = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem 1rem 4rem 1rem;

  @media (min-width: 1024px) {
    max-width: 667px;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  margin-top: 1.5rem;
  border: 0;
  text-transform: uppercase;
  background: linear-gradient(135deg, #F37440 0%, #B84A1C 100%);
  color: #fff;
  padding: 1rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 8px 24px rgba(243, 116, 64, 0.35);
  transition: all 0.3s ease;
  font-family: "Nunito", sans-serif;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #F37440 0%, #B84A1C 100%);
    box-shadow: 0 12px 32px rgba(243, 116, 64, 0.45);
    transform: translateY(-2px);
  }

  &:disabled {
    background: #cbd5e1;
    color: #94a3b8;
    transform: none;
  }
`;

const OTPContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 0 0.25rem;
`;

const InfoBanner = styled.div`
  background: linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%);
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #c7d2fe;
`;

const IconContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  background-color: #fff;
  padding: 0.5rem;
  border-radius: 0.5rem;
`;

const AuthenticationOTP = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // RTK Query mutations - same as SignIn component
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();

  const [mobileNumber, setMobileNumber] = useState("");

  useEffect(() => {
    // Get mobile number from localStorage or navigate back if not available
    const storedIdentifier = localStorage.getItem("loginIdentifier");
    if (storedIdentifier) {
      try {
        const parsed = JSON.parse(storedIdentifier);
        if (parsed && parsed.number) {
          setMobileNumber(parsed.number);
        } else {
          setMobileNumber(storedIdentifier);
        }
      } catch {
        setMobileNumber(storedIdentifier);
      }
    } else {
      navigate("/signin");
    }
  }, [navigate]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const themeConfig = useSelector((state: RootState) => state.themeConfig);

  // OTP handling functions - same as SignIn component
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter complete 6-digit OTP");
      return;
    }

    try {
      const response = await verifyOtp({
        mobile_number: mobileNumber,
        otp: otpString,
      }).unwrap();

      const token = extractAuthToken(response);

      if (!token) {
        toast.error("Login failed: No token received");
        return;
      }

      setTokenV2(token);
      setStoredAuthRoles(extractAuthRoles(response, token));
      setStoredRefreshSession(extractRefreshSession(response, token));
      setStoredUserProfile(extractAuthUserProfile(response, token));
      dispatch(setToken(token));
      toast.success("Login successful!");
      navigate("/apps");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.data?.detail || "Invalid OTP");
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;

    try {
      const result = await sendOtp({ mobile_number: mobileNumber }).unwrap();

      if (result?.terms_accepted === false) {
        // Handle terms acceptance if needed
        toast.error("Please accept terms and conditions");
      } else {
        toast.success("OTP sent successfully!");
        setTimer(60);
        setIsTimerActive(true);
        setOtp(Array(6).fill("")); // Reset OTP fields
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus(); // Focus first input
        }
      }
    } catch (error: any) {
      toast.error(error?.data?.detail || "Failed to send OTP");
    }
  };

  const maskMobileNumber = (number: string): string => {
    if (number.length <= 6) {
      return `${number.slice(0, 1)}***${number.slice(-1)}`;
    }
    const first3 = number.slice(0, 3);
    const last3 = number.slice(-3);
    return `+91 ${first3}****${last3}`;
  };

  return (
    <LoginContainer>
      <BackgroundImage
        src="/assets/images/auth/bg-gradient.png"
        alt="background"
      />
      <MainContainer className="dark:bg-[#060818]">
        <img
          src="/assets/images/auth/coming-soon-object1.png"
          alt="decoration"
          className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2"
        />
        <img
          src="/assets/images/auth/coming-soon-object2.png"
          alt="decoration"
          className="absolute left-24 top-0 h-40 md:left-[30%]"
        />
        <img
          src="/assets/images/auth/coming-soon-object3.png"
          alt="decoration"
          className="absolute right-0 top-0 h-[300px]"
        />
        <img
          src="/assets/images/auth/polygon-object.png"
          alt="decoration"
          className="absolute bottom-0 end-[28%]"
        />

        <ContentCard theme={themeConfig.theme}>
          <LeftPanel className="ltr:xl:skew-x-[14deg] rtl:xl:skew-x-[-14deg]">
            <div className="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent ltr:-right-10 ltr:bg-gradient-to-r rtl:-left-10 rtl:bg-gradient-to-l xl:w-16 ltr:xl:-right-20 rtl:xl:-left-20"></div>
            <div className="ltr:xl:-skew-x-[14deg] rtl:xl:skew-x-[14deg]">
              <Link to="/" className="w-50 block lg:w-72 mx-auto">

              </Link>
              <div className="mt-24 hidden w-full max-w-[430px] lg:block">
                <img
                  src="/assets/images/auth/login.svg"
                  alt="Cover Image"
                  className="w-full"
                />
              </div>
            </div>
          </LeftPanel>

          <RightPanel>
            <div className="flex w-full max-w-[440px] items-center gap-2 lg:absolute lg:end-6 lg:top-6 lg:max-w-full">
              <Link to="/" className="w-8 block lg:hidden">
                <img
                  src="/assets/images/logo.png"
                  alt="Logo"
                  className="mx-auto w-10"
                />
              </Link>
            </div>

            <div className="w-full max-w-[440px] lg:mt-16">
              <div className="mb-10">
                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">
                  Verify OTP
                </h1>
                <p className="text-base font-bold leading-normal text-white-dark">
                  Verify your identity with the code sent to
                </p>
                <p className="text-base font-bold leading-normal text-white-dark">
                  {maskMobileNumber(mobileNumber)}
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-danger/10 text-danger dark:bg-danger/15 rounded-md">
                  {errorMessage}
                </div>
              )}

              {/* OTP Info Banner */}
              <InfoBanner>
                <IconContainer>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="#25D366"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.8930 11.84-5.346 11.84-11.893C23.99 5.325 18.654.001 12.1.001z" />
                  </svg>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="#F37440"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </IconContainer>
                <span
                  className="font-outfit text-[0.85rem] leading-[1.5] text-slate-600"
                >
                  OTP sent via <strong>WhatsApp</strong> and{" "}
                  <strong>SMS</strong> to +91 {maskMobileNumber(mobileNumber)}
                </span>
              </InfoBanner>

              <div className="mb-4 text-center">
                <h3 className="mb-2 text-base font-bold text-gray-800 font-nunito dark:text-gray-200">
                  Enter 6-Digit Verification Code
                </h3>
              </div>

              {/* OTP Input Fields */}
              <OTPContainer>
                {Array.from({ length: 6 }).map((_, index) => (
                  <OTPInput
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    maxLength={1}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus={index === 0}
                  />
                ))}
              </OTPContainer>

              {/* Resend OTP */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <span
                  className={`text-sm font-medium font-nunito ${timer > 0 ? "text-gray-400" : "text-gray-600 dark:text-gray-400"
                    }`}
                >
                  {timer > 0
                    ? `Resend in ${timer}s`
                    : "Didn't receive the code?"}
                </span>
                <ResendButton
                  onClick={handleResendOtp}
                  disabled={timer > 0 || isSendingOtp}
                >
                  Resend OTP
                </ResendButton>
              </div>

              <SubmitButton onClick={handleVerifyOtp} disabled={isVerifyingOtp}>
                {isVerifyingOtp ? "Verifying..." : "Verify & Sign In"}
              </SubmitButton>

              {/* Back Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    navigate("/signin");
                  }}
                  className="px-4 py-2 text-sm font-semibold bg-transparent border-none rounded cursor-pointer font-nunito text-[#F37440] hover:bg-[#F37440]/10 transition-colors"
                >
                  ← Back to mobile number
                </button>
              </div>
            </div>
          </RightPanel>
        </ContentCard>
      </MainContainer>
    </LoginContainer>
  );
};

export default AuthenticationOTP;
