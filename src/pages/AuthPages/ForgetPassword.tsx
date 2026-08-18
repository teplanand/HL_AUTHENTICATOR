/* eslint-disable @typescript-eslint/no-unused-vars */
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import {
  Box,
  Button,
  Collapse,
  Container,
  Fade,
  Link,
  Slide,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import "react-phone-input-2/lib/style.css";
import { toast } from "react-toastify";

import { useNavigate } from "react-router";
 
import Web from "../../../shared/assets/Web.png";
import {
  useResetPasswordMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "./api/login";
import logo from "../../../shared/assets/logo1.png";

export default function ForgotPassword() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
  const [resetPassword, { isLoading: isResetPassword }] =
    useResetPasswordMutation();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const handleSendOtp = async () => {
    if (loginMethod === "email" && (!email || !email.includes("@"))) {
      toast.error("Enter a valid email address");
      return;
    }
    try {
      const requestData = { email };
      await sendOtp(requestData).unwrap();
      toast.success("OTP sent successfully!");
      setStep(2);
      setTimer(60);
      setIsTimerActive(true);
    } catch (error: any) {
      console.log("🚨 -  handleSendOtp -  error:", error);
      toast.error(error?.data?.detail || "Failed to send OTP");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter complete 6-digit OTP");
      return;
    }
    try {
      const requestData = {
        email,
        otp: otpString,
      };
      await verifyOtp(requestData).unwrap();
      toast.success("OTP verified successfully");
      setStep(3);
    } catch (error: any) {
      toast.error(error.data?.detail || "Invalid OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault(); // 🚨 STOP redirect

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const requestData = { email, password };
      const result = await resetPassword(requestData).unwrap();
      // window.prompt(result);
      toast.success("Password reset successful! Login using new password");
      navigate("/signin");
    } catch (error) {
      toast.error(
        error?.data?.detail ||
        "Something went wrong while resetting the password",
      );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
       
        backgroundRepeat: "no-repeat",
        backgroundSize: "105% 105%", 
        backgroundPosition: "center",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="sm">
          <Slide in direction="left" timeout={700}>
            <Box
              sx={{
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: "4px",
                p: { xs: 2.5, sm: 3 },
                maxWidth: 450,
                mx: "auto",
                boxShadow:
                  "0 20px 60px rgba(55,130,242,0.15), 0 10px 30px rgba(0,0,0,0.08)",
                border: "1px solid rgba(55,130,242,0.12)",
              }}
            >
              <Box>
                <img src={logo} alt="elecon Logo" className="h-10" />

                 <Box sx={{ my: 5 }}>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                       
                      sx={{ color: "text.primary" }}
                    >
                       {step === 1 && "Forgot your password"}
                      {step === 2 && "Verify OTP"}
                      {step === 3 && "Set a new password"}
                    </Typography>
                    {step === 1 && (
                      <Typography variant="body1" color="text.secondary">
                        Enter your email to reset your password
                      </Typography>
                    )}
                    {step === 2 && (
                      <Typography variant="body1" color="text.secondary">
                        Enter the OTP sent to your email
                      </Typography>
                    )}
                    {step === 3 && (
                      <Typography variant="body1" color="text.secondary">
                        Enter your new password
                      </Typography>
                    )}
                  </Box>


                
              </Box>

              <Collapse in={step === 1} timeout={250} unmountOnExit>
                <Fade in={step === 1} mountOnEnter unmountOnExit>
                  <Box>
                    {/* Label */}
                    <Typography
                      sx={{
                        mb: 0.5,
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#475569",
                        fontFamily: '"Nunito", sans-serif',
                      }}
                    >
                      Email Address
                    </Typography>

                    {/* Input */}
                    <TextField
                      fullWidth
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      sx={{
                        mb: 1,
                        "& .MuiOutlinedInput-root": {
                          height: "46px",
                          padding: "4px",
                          borderRadius: "4px",
                          backgroundColor: "rgba(255,255,255,0.95)",
                          fontFamily: '"Nunito", sans-serif',
                          fontSize: "0.9rem",
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#3782f2",
                            borderWidth: "2px",
                            boxShadow: "0 0 0 3px rgba(55,130,242,0.15)",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "1.5px solid rgba(203,213,225,0.9)",
                          },
                        },
                      }}
                    />

                    {/* Helper (tight) */}
                    <Typography
                      sx={{
                        mb: 1.5,
                        fontSize: "0.72rem",
                        color: "#64748b",
                        fontFamily: '"Nunito", sans-serif',
                      }}
                    >
                      We’ll send a verification code to this email
                    </Typography>

                    {/* Button */}
                    <Button
                      fullWidth
                      size="large"
                      variant="contained"
                      disabled={isSendingOtp}
                      onClick={handleSendOtp}
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        background:
                          "linear-gradient(135deg, #3782f2 0%, #2563eb 100%)",
                        boxShadow:
                          "0 6px 12px -3px rgba(55,130,242,0.4), 0 3px 6px -2px rgba(55,130,242,0.3)",
                        fontFamily: '"Nunito", sans-serif',
                      }}
                      className="rounded-sm"
                    >
                      Send OTP
                    </Button>
                  </Box>
                </Fade>
              </Collapse>

              <Collapse in={step === 2} timeout={250} unmountOnExit>
                <Fade in={step === 2} mountOnEnter unmountOnExit>
                  <Box>
                    <Box
                      display="flex"
                      justifyContent="center"
                      gap={1.5}
                      mb={3}
                    >
                      {otp.map((v, i) => (
                        <TextField
                          key={i}
                          id={`otp-input-${i}`}
                          value={v}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(i, e)}
                          inputProps={{
                            maxLength: 1,
                            inputMode: "numeric",
                            style: {
                              textAlign: "center",
                              fontSize: "1.4rem",
                              fontWeight: 700,
                              padding: "5px 5px",
                              color: "#0f172a",
                              fontFamily: '"Nunito", sans-serif',
                            },
                          }}
                          sx={{
                            width: "45px",
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "4px",
                              backgroundColor: "#f8fafc",
                              transition: "all 0.2s ease",
                              "&.Mui-focused": {
                                backgroundColor: "#ffffff",
                                transform: "scale(1.05)",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#3782f2",
                                  borderWidth: "2px",
                                  boxShadow:
                                    "0 0 0 4px rgba(55, 130, 242, 0.15)",
                                },
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "1.5px solid rgba(203, 213, 225, 0.8)",
                                transition: "all 0.2s ease",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#94a3b8",
                              },
                            },
                          }}
                        />
                      ))}
                    </Box>
                    <Typography
                      align="center"
                      sx={{ mb: 2, fontSize: 13, color: "#94a3b8" }}
                    >
                      {timer > 0
                        ? `Resend OTP in ${timer}s`
                        : "You can resend OTP"}
                    </Typography>
                    <Button
                      disabled={isVerifyingOtp}
                      fullWidth
                      size="large"
                      variant="contained"
                      onClick={handleVerifyOtp}
                    >
                      Verify OTP
                    </Button>
                  </Box>
                </Fade>
              </Collapse>

              <Collapse in={step === 3} timeout={250} unmountOnExit>
                <Fade in={step === 3} mountOnEnter unmountOnExit>
                  <Box>
                    <TextField
                      fullWidth
                      type="password"
                      placeholder="New password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      sx={{ mb: 3 }}
                    />
                    <Button
                      fullWidth
                      type="button"
                      size="large"
                      variant="contained"
                      onClick={handleResetPassword}
                    >
                      Reset Password
                    </Button>
                  </Box>
                </Fade>
              </Collapse>

              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: "1px dashed rgba(203,213,225,0.6)",
                  textAlign: "center",
                }}
              >
                <Link
                  component="button"
                  variant="body2"
                  // startIcon={
                  //     <ArrowBackIosNewRoundedIcon sx={{ fontSize: 14 }} />
                  // }
                  onClick={() => navigate("/signin")}
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#475569",
                    textTransform: "none",
                    fontFamily: '"Nunito", sans-serif',
                    textDecoration: "none",
                    "&:hover": {
                      backgroundColor: "transparent",
                      color: "#2563eb",
                    },
                  }}
                >
                  Back to Sign in
                </Link>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: "0.7rem",
                    color: "#94a3b8",
                    fontFamily: '"Nunito", sans-serif',
                  }}
                >
                  Remembered your password? Sign in to your account
                </Typography>
              </Box>
            </Box>
          </Slide>
        </Container>
      </Box>
    </Box>
  );
}
