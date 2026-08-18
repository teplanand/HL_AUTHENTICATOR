import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.scss";
import "./global.scss";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { store } from "./redux/store";

import Dialog from "./components/Dialog/index.tsx";
import Modal from "./components/Modal/index.tsx";
import Confirmation from "./components/Confirmation/index.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <ThemeProvider>

                    <ToastContainer
                                position="top-right"
                                autoClose={3000}
                                hideProgressBar={false}
                                newestOnTop={false}
                                closeOnClick
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                                className="custom-toast-container"
                            />
                            <App />

                            <Modal/>
                      <Confirmation/>
                      <Dialog/>
                            

                    
                </ThemeProvider>
            </LocalizationProvider>
        </Provider>
    </StrictMode>
);
