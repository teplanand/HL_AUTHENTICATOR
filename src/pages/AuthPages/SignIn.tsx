import { FormEvent, useState } from "react";
import { useEmailLoginMutation } from "./api/login";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import {
  Box,
  TextField,
  Typography,
  Fade,
  Button,
  Container,
  FormControlLabel,
  Checkbox,
  Link,
  keyframes,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  extractAuthRoles,
  extractRefreshSession,
  extractAuthToken,
  extractAuthUserProfile,
  setStoredAuthRoles,
  setStoredAccessibleApps,
  setStoredRefreshSession,
  setStoredUserProfile,
  setToken as setTokenV2,
} from "../../../shared/utils/auth";
import { clearStoredDynamicAppAccessPayloads } from "../Authenticator/utils/appPermissionAccess";
import { useDispatch } from "react-redux";
import { setToken } from "../../../shared/redux/authSlice";
import { resetAllState } from "../../../shared/redux/store";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import logo from "../../../shared/assets/elecon-group-of-company.png";
import signinLeftImage from "../../../shared/assets/singin-login.png";
import { useLazyGetAuthenticatorDashboardAppsQuery } from "../Authenticator/api/authenticator";

// --- ANIMATIONS ---

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const floatReverse = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(20px); }
  100% { transform: translateY(0px); }
`;

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [emailLogin, { isLoading: isEmailLoggingIn }] = useEmailLoginMutation();
  const [fetchDashboardApps] = useLazyGetAuthenticatorDashboardAppsQuery();

  const navigate = useNavigate();
  const dispatch = useDispatch();




  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }

    try {
      const response = await emailLogin({
        username,
        password,
      }).unwrap();

      // const response = {
      //   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IlN1cGVyIEFkbWluIiwiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJyb2xlX2lkIjoxLCJwZXJtaXNzaW9ucyI6eyJhbGxfbW9kdWxlcyI6WyJhZGQiLCJlZGl0IiwidmlldyIsImRlbGV0ZSJdfSwiZXhwIjoxNzc0MDc5NDQzfQ.s128IA8ixJmHEjrD2emvJrA-VhjanJ3nmwNMEp90yVw",
      //   permissions: ["add", "edit", "view", "delete"],
      //   access_token:''
      // };
      const token = extractAuthToken(response);
      if (token) {
        setTokenV2(token);
        setStoredAuthRoles(extractAuthRoles(response, token));
        setStoredRefreshSession(extractRefreshSession(response, token));
        setStoredUserProfile(extractAuthUserProfile(response, token));
        dispatch(setToken(token));
        resetAllState();
        localStorage.setItem("loginIdentifier", username);
        localStorage.removeItem("permissions");
        clearStoredDynamicAppAccessPayloads();

        try {
          const dashboardResponse = await fetchDashboardApps().unwrap();
          setStoredAccessibleApps(dashboardResponse?.data ?? []);
        } catch (dashboardError) {
          console.error("Dashboard apps fetch failed:", dashboardError);
          setStoredAccessibleApps([]);
        }

        toast.success("Login successful!");
        navigate("/apps");
      } else {
        toast.error("Login failed: No token received");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(
        error?.data?.detail || error?.data?.message || "Login failed",
      );
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleLogin();
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      {/* Left Panel - Image Placeholder Section */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "50%",
          height: "100vh",
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
              : "linear-gradient(135deg, #FFF5F2 0%, #FFE4D6 100%)",
          overflow: "hidden",
        }}
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(243, 116, 64, 0.2) 0%, transparent 70%)",
            filter: "blur(50px)",
            animation: `${float} 10s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "10%",
            right: "10%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(55, 130, 242, 0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: `${floatReverse} 12s ease-in-out infinite`,
          }}
        />

        {/* Main Image */}
        <Box
          component="img"
          src={signinLeftImage}
          alt="Sign In Visual"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 2,
          }}
        />
      </Box>

      {/* Right Panel - Form Section */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          background: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.background.default
              : "#fff",
        }}
      >
        <Container maxWidth="xs" sx={{ textAlign: "center" }}>
          {/* Logo */}
          <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                height: 50,
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
              }}
            />
          </Box>

          {/* Heading */}
          <Box sx={{ mb: 5 }}>
            {/* <Typography
              variant="h4"
              fontWeight={800}
               
              sx={{ color: "text.primary" }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to continue to Elecon
            </Typography> */}
          </Box>

          {/* Form Content */}
          <Box sx={{ width: "100%" }}>
            <Fade in={true}>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ textAlign: "left" }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{ mb: 1, ml: 0.5 }}
                >
                  Employee ID
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  margin="none"
                  autoFocus
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "4px",
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.03)"
                          : "#f9fafb",
                    },
                  }}
                />

                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{ mb: 1, ml: 0.5 }}
                >
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="none"
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "4px",
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.03)"
                          : "#f9fafb",
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        size="small"
                        sx={{ color: "primary.main" }}
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        Remember me
                      </Typography>
                    }
                  />
                  <Link
                    
                    variant="body2"
                    onClick={() => navigate("/forgot-password")}
                    sx={{
                      fontWeight: 600,
                      textDecoration: "none",
                      color: "primary.main",
                      cursor:"pointer",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  type="submit"
                  disabled={isEmailLoggingIn}
                  sx={{
                    py: 1.8,
                    borderRadius: "4px",
                    fontWeight: 700,
                    fontSize: "1rem",
                    boxShadow: "0 10px 30px rgba(243, 116, 64, 0.3)",
                    background:
                      "linear-gradient(135deg, #F37440 0%, #B84A1C 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #FF8A50 0%, #D85A2C 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 35px rgba(243, 116, 64, 0.4)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {isEmailLoggingIn ? "Signing in..." : "Sign In"}
                </Button>
              </Box>
            </Fade>

            {/* <Box mt={5} textAlign="center">
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ opacity: 0.7 }}
              >
                © {new Date().getFullYear()} Elecon. All rights reserved.
              </Typography>
            </Box> */}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
