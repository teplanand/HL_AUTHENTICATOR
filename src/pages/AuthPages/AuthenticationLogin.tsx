// AuthenticationLogin.tsx
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { RootState } from "../../../shared/redux/store";
import { useSendOtpMutation } from "./api/login";
import { toast } from "react-toastify";

// Keyframe animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

// Styled components
const LoginContainer = styled.div`
  position: relative;
  min-height: 100vh;
  overflow: hidden;
`;

const BackgroundImage = styled.img`
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  opacity: 0.4;
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

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        circle at 30% 50%,
        rgba(243, 116, 64, 0.15) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 70% 50%,
        rgba(54, 59, 99, 0.15) 0%,
        transparent 50%
      );
    pointer-events: none;
  }
`;

const ContentCard = styled.div<{ isDark?: boolean }>`
  position: relative;
  display: flex;
  width: 100%;
  max-width: 1502px;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  border-radius: 24px;
  background: ${(props) =>
    props.isDark ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.85)"};
  backdrop-filter: blur(40px);
  box-shadow: ${(props) =>
    props.isDark
      ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)"
      : "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5)"};
  animation: ${fadeIn} 0.8s ease-out;
  border: 1px solid
    ${(props) =>
      props.isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.3)"};

  @media (min-width: 1024px) {
    flex-direction: row;
    gap: 2.5rem;
    min-height: 758px;
  }

  @media (min-width: 1280px) {
    gap: 0;
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
    rgba(243, 116, 64, 0.9) 50%,
    rgba(243, 116, 64, 1) 100%
  );
  padding: 1.25rem;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    background-size: 200% 200%;
    animation: ${shimmer} 3s linear infinite;
  }

  @media (min-width: 1024px) {
    display: inline-flex;
    max-width: 835px;
  }

  @media (min-width: 1280px) {
    margin-inline-start: -7rem;
    transform: skewX(14deg);
  }
`;

const LogoContainer = styled.div`
  animation: ${float} 6s ease-in-out infinite;
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
  animation: ${slideInLeft} 0.8s ease-out;

  @media (min-width: 640px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  @media (min-width: 1024px) {
    max-width: 667px;
  }
`;

const TabContainer = styled.div<{ isDark?: boolean }>`
  display: flex;
  background: ${(props) =>
    props.isDark ? "rgba(30, 41, 59, 0.8)" : "rgba(241, 245, 249, 0.8)"};
  border-radius: 16px;
  padding: 6px;
  margin-bottom: 2rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid
    ${(props) =>
      props.isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"};
`;

const TabButton = styled.button<{ active: boolean; isDark?: boolean }>`
  flex: 1;
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  background: ${(props) => (props.active ? "#F37440" : "transparent")};
  color: ${(props) =>
    props.active ? "#FFFFFF" : props.isDark ? "#94A3B8" : "#64748B"};
  font-weight: ${(props) => (props.active ? "700" : "600")};
  font-size: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  font-family: "Nunito", sans-serif;
  letter-spacing: 0.3px;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: #f37440;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    transform: ${(props) => (props.active ? "scale(1.02)" : "scale(1)")};
    color: ${(props) => (props.active ? "#FFFFFF" : "#F37440")};

    &::before {
      opacity: ${(props) => (props.active ? "0" : "0.1")};
    }
  }

  ${(props) =>
    props.active &&
    `
    box-shadow: 0 8px 16px -4px rgba(243, 116, 64, 0.5),
                0 4px 8px -2px rgba(243, 116, 64, 0.3);
  `}
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 1.5rem;
`;

const InputLabel = styled.label<{ isDark?: boolean }>`
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => (props.isDark ? "#E2E8F0" : "#475569")};
  font-family: "Nunito", sans-serif;
  letter-spacing: 0.3px;
`;

const PhoneInputContainer = styled.div<{ isDark?: boolean }>`
  width: 100%;

  .react-tel-input {
    font-family: "Nunito", sans-serif;
  }

  .form-control {
    width: 100%;
    height: 58px;
    border-radius: 14px;
    border: 2px solid
      ${(props) =>
        props.isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(203, 213, 225, 0.8)"};
    padding-left: 60px;
    font-family: "Nunito", sans-serif;
    font-size: 16px;
    background: ${(props) =>
      props.isDark ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.9)"};
    color: ${(props) => (props.isDark ? "#F1F5F9" : "#0F172A")};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    &:focus {
      outline: none;
      border-color: #f37440;
      box-shadow:
        0 0 0 4px rgba(243, 116, 64, 0.15),
        0 4px 12px rgba(243, 116, 64, 0.2);
      transform: translateY(-2px);
    }

    &::placeholder {
      color: ${(props) => (props.isDark ? "#64748B" : "#94A3B8")};
    }
  }

  .flag-dropdown {
    border-radius: 14px 0 0 14px;
    background: ${(props) =>
      props.isDark ? "rgba(30, 41, 59, 0.7)" : "rgba(248, 250, 252, 0.9)"};
    border: 2px solid
      ${(props) =>
        props.isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(203, 213, 225, 0.8)"};
    border-right: none;
    transition: all 0.3s ease;

    &:hover {
      background: ${(props) =>
        props.isDark ? "rgba(51, 65, 85, 0.7)" : "rgba(241, 245, 249, 0.9)"};
    }
  }

  .selected-flag {
    padding: 0 0 0 16px;

    &:hover,
    &:focus {
      background: transparent;
    }
  }
`;

const EmailInput = styled.input<{ isDark?: boolean }>`
  width: 100%;
  height: 58px;
  border-radius: 14px;
  border: 2px solid
    ${(props) =>
      props.isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(203, 213, 225, 0.8)"};
  padding: 0 20px;
  font-family: "Nunito", sans-serif;
  font-size: 16px;
  background: ${(props) =>
    props.isDark ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.9)"};
  color: ${(props) => (props.isDark ? "#F1F5F9" : "#0F172A")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    border-color: #f37440;
    box-shadow:
      0 0 0 4px rgba(243, 116, 64, 0.15),
      0 4px 12px rgba(243, 116, 64, 0.2);
    transform: translateY(-2px);
  }

  &::placeholder {
    color: ${(props) => (props.isDark ? "#64748B" : "#94A3B8")};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  margin-top: 2rem;
  border: none;
  text-transform: uppercase;
  background: #f37440;
  color: white;
  padding: 18px 32px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 1px;
  font-family: "Nunito", sans-serif;
  box-shadow:
    0 12px 24px -8px rgba(243, 116, 64, 0.5),
    0 8px 16px -4px rgba(243, 116, 64, 0.4);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: #e05e30;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow:
      0 16px 32px -8px rgba(243, 116, 64, 0.6),
      0 12px 20px -4px rgba(243, 116, 64, 0.5);

    &::before {
      opacity: 1;
    }

    &::after {
      transform: translateX(100%);
    }
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;

    &:hover {
      transform: none;
      box-shadow:
        0 12px 24px -8px rgba(243, 116, 64, 0.5),
        0 8px 16px -4px rgba(243, 116, 64, 0.4);
    }
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

const Title = styled.h1<{ isDark?: boolean }>`
  font-size: 2.5rem;
  font-weight: 800;
  text-transform: uppercase;
  line-height: 1.2;
  background: linear-gradient(135deg, #f37440 0%, #b84a1c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  font-family: "Nunito", sans-serif;
  letter-spacing: -0.5px;

  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled.p<{ isDark?: boolean }>`
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  color: ${(props) => (props.isDark ? "#94A3B8" : "#64748B")};
  font-family: "Nunito", sans-serif;
  letter-spacing: 0.2px;
`;

const ErrorMessage = styled.div<{ isDark?: boolean }>`
  margin-bottom: 1.5rem;
  padding: 16px 20px;
  background: ${(props) =>
    props.isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.1)"};
  color: ${(props) => (props.isDark ? "#FCA5A5" : "#DC2626")};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid
    ${(props) =>
      props.isDark ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.2)"};
  animation: ${fadeIn} 0.3s ease-out;
  font-family: "Nunito", sans-serif;
`;

const DecorationImage = styled.img<{ position: string }>`
  position: absolute;
  pointer-events: none;
  opacity: 0.6;
  animation: ${pulse} 4s ease-in-out infinite;

  ${(props) => {
    switch (props.position) {
      case "left":
        return `
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 100%;
          max-height: 893px;
        `;
      case "top-left":
        return `
          left: 6rem;
          top: 0;
          height: 10rem;
          @media (min-width: 768px) {
            left: 30%;
          }
        `;
      case "top-right":
        return `
          right: 0;
          top: 0;
          height: 300px;
        `;
      case "bottom":
        return `
          bottom: 0;
          right: 28%;
        `;
      default:
        return "";
    }
  }}
`;

const AuthenticationLogin = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();

  const themeConfig = useSelector((state: RootState) => state.themeConfig);
  const isDark = themeConfig.theme === "dark";

  const handleSendOtp = async () => {
    setErrorMessage(null);

    // Validation based on login method
    if (
      loginMethod === "phone" &&
      (!phoneNumber || phoneNumber.replace(/\D/g, "").length < 10)
    ) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    if (loginMethod === "email" && (!email || !email.includes("@"))) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const requestData: any = {};

      if (loginMethod === "phone") {
        requestData.mobile_number = phoneNumber.replace(/\D/g, "").slice(-10);
      } else {
        requestData.email = email;
      }

      const result = await sendOtp(requestData).unwrap();

      if (result?.terms_accepted === false) {
        toast.error("Please accept terms and conditions");
      } else {
        const identifier =
          loginMethod === "phone"
            ? JSON.stringify({
                countryCode: "+91",
                number: phoneNumber.replace(/\D/g, "").slice(-10),
                type: "phone",
              })
            : email;

        localStorage.setItem("loginIdentifier", identifier);

        toast.success("OTP sent successfully!");
        navigate("/otp-verify");
      }
    } catch (error: any) {
      toast.error(error?.data?.detail || "Failed to send OTP");
    }
  };

  return (
    <LoginContainer>
      <BackgroundImage
        src="/assets/images/auth/bg-gradient.png"
        alt="background"
      />
      <MainContainer className={isDark ? "dark:bg-[#060818]" : ""}>
        <DecorationImage
          src="/assets/images/auth/coming-soon-object1.png"
          alt="decoration"
          position="left"
        />
        <DecorationImage
          src="/assets/images/auth/coming-soon-object2.png"
          alt="decoration"
          position="top-left"
        />
        <DecorationImage
          src="/assets/images/auth/coming-soon-object3.png"
          alt="decoration"
          position="top-right"
        />
        <DecorationImage
          src="/assets/images/auth/polygon-object.png"
          alt="decoration"
          position="bottom"
        />

        <ContentCard isDark={isDark}>
          <LeftPanel className="ltr:xl:skew-x-[14deg] rtl:xl:skew-x-[-14deg]">
            <div className="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent ltr:-right-10 ltr:bg-gradient-to-r rtl:-left-10 rtl:bg-gradient-to-l xl:w-16 ltr:xl:-right-20 rtl:xl:-left-20"></div>
            <div className="ltr:xl:-skew-x-[14deg] rtl:xl:skew-x-[14deg]">
              <LogoContainer>
                <a href="/" className="w-50 block lg:w-72 mx-auto">log</a>
              </LogoContainer>
              <div className="mt-24 hidden w-full max-w-[430px] lg:block">
logo
              </div>
            </div>
          </LeftPanel>

          <RightPanel>
            <div className="flex w-full max-w-[440px] items-center gap-2 lg:absolute lg:end-6 lg:top-6 lg:max-w-full">
              <a href="/" className="w-8 block lg:hidden">
                <img
                  src="/assets/images/logo.png"
                  alt="Logo"
                  className="mx-auto w-10"
                />
              </a>
            </div>

            <div className="w-full max-w-[440px] lg:mt-16">
              <div className="mb-10">
                <Title isDark={isDark}>Sign in</Title>
                <Subtitle isDark={isDark}>
                  Please provide your registered email address or mobile number
                  to access your account.
                </Subtitle>
              </div>

              {errorMessage && (
                <ErrorMessage isDark={isDark}>{errorMessage}</ErrorMessage>
              )}

              <TabContainer isDark={isDark}>
                <TabButton
                  active={loginMethod === "phone"}
                  isDark={isDark}
                  onClick={() => setLoginMethod("phone")}
                >
                  Phone
                </TabButton>
                <TabButton
                  active={loginMethod === "email"}
                  isDark={isDark}
                  onClick={() => setLoginMethod("email")}
                >
                  Email
                </TabButton>
              </TabContainer>

              {loginMethod === "phone" ? (
                <InputWrapper>
                  <InputLabel isDark={isDark}>Mobile Number</InputLabel>
                  <PhoneInputContainer isDark={isDark}>
                    <PhoneInput
                      country={"in"}
                      value={phoneNumber}
                      onChange={(value) => setPhoneNumber(value)}
                      placeholder="Enter your mobile number"
                      inputProps={{
                        name: "phone",
                        required: true,
                        autoFocus: true,
                      }}
                      disableCountryCode={false}
                      enableAreaCodes={true}
                    />
                  </PhoneInputContainer>
                </InputWrapper>
              ) : (
                <InputWrapper>
                  <InputLabel isDark={isDark}>Email Address</InputLabel>
                  <EmailInput
                    type="email"
                    value={email}
                    isDark={isDark}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    autoFocus
                  />
                </InputWrapper>
              )}

              <SubmitButton onClick={handleSendOtp} disabled={isSendingOtp}>
                <span>
                  {isSendingOtp ? "Sending OTP..." : "Continue with OTP"}
                </span>
              </SubmitButton>
            </div>
          </RightPanel>
        </ContentCard>
      </MainContainer>
    </LoginContainer>
  );
};

export default AuthenticationLogin;
