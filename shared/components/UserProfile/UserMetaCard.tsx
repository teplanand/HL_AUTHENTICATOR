import { motion } from "framer-motion";
import { useModal } from "../../hooks/useModal";
import Button from "../ui/button/Button";
import {
  Avatar,
  Box,
  TextField as Input,
  Modal,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from "@mui/material";
import Label from "../form/Label";
import { getDecodedToken } from "../../utils/auth";
import {
  useGetUserQuery,
  useUpdateUserMutation,
} from "../../../src/pages/Authenticator/api/user";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
} from "@mui/icons-material";

// Validation Schema
const userProfileSchema = Yup.object().shape({
  first_name: Yup.string()
    .required("First name is required")
    .max(50, "First name too long"),
  last_name: Yup.string()
    .required("Last name is required")
    .max(50, "Last name too long"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  gender: Yup.string()
    .required("Gender is required")
    .oneOf(["male", "female"], "Please select a gender"),
});

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Custom Modal styling
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "600px",
  bgcolor: "background.paper",
  borderRadius: "4px",
  boxShadow: 24,
  p: 4,
  maxHeight: "90vh",
  overflowY: "auto",
  "&:focus-visible": {
    outline: "none",
  },
};

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const user = getDecodedToken();
  const { data, isLoading, refetch } = useGetUserQuery(user.id);
  const [updateUser] = useUpdateUserMutation();

  const formik = useFormik({
    initialValues: {
      first_name: data?.first_name || "",
      last_name: data?.last_name || "",
      email: data?.email || "",
      phone: data?.phone || "",
      gender: data?.gender || "male",
    },
    validationSchema: userProfileSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await updateUser({ id: user.id, ...values }).unwrap();
        refetch();
        toast.success("Profile updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        closeModal();
      } catch (error) {
        toast.error("Failed to update profile. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        console.error("Update error:", error);
      }
    },
  });

  const handleGenderChange = (gender: string) => {
    formik.setFieldValue("gender", gender);
  };

  if (isLoading)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center p-8"
      >
        <div className="w-8 h-8 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
      </motion.div>
    );

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm transition-all hover:shadow-md"
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          {/* Profile Picture */}
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              <Avatar className="ring-2 ring-blue-500/20 w-20 h-20 text-2xl">
                <PersonIcon fontSize="large" />
              </Avatar>
            </motion.div>

            {/* Profile Info - Using Static Data */}
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-2xl font-bold text-center text-gray-800 xl:text-left">
                {data?.first_name} {data?.last_name}
              </h4>

              <div className="flex flex-col items-center gap-3 text-center xl:flex-row xl:gap-4 xl:text-left">
                {/* Email */}
                <div className="flex items-center gap-2">
                  <MailIcon fontSize="small" className="text-blue-600" />
                  <span className="text-sm text-gray-700">{data?.email} </span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2">
                  <PhoneIcon fontSize="small" className="text-gray-600" />
                  <span className="text-sm text-gray-700">{data?.phone} </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-blue-600 transition-colors lg:inline-flex lg:w-auto"
          >
            <EditIcon fontSize="small" />
            Edit Profile
          </motion.button>
        </div>
      </motion.div>
      <Modal
        open={isOpen}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{
          backdropFilter: "blur(4px)",
        }}
      >
        <Box sx={modalStyle}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <motion.h4
                className="text-2xl font-bold text-gray-800 dark:text-white"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Edit Profile Information
              </motion.h4>
              <motion.p
                className="text-sm text-gray-500 dark:text-gray-400 mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                Update your personal details
              </motion.p>
            </div>

            <form onSubmit={formik.handleSubmit}>
              <motion.div
                className="space-y-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Personal Information Section */}
                <motion.div className="space-y-4" variants={staggerContainer}>
                  <motion.div
                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                    variants={staggerContainer}
                  >
                    <motion.div variants={itemAnimation}>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        placeholder="Enter first name"
                        value={formik.values.first_name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.first_name &&
                          Boolean(formik.errors.first_name)
                        }
                        helperText={
                          formik.touched.first_name &&
                            typeof formik.errors.first_name === "string"
                            ? formik.errors.first_name
                            : undefined
                        }
                        fullWidth
                        size="small"
                      />
                    </motion.div>

                    <motion.div variants={itemAnimation}>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        placeholder="Enter last name"
                        value={formik.values.last_name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.last_name &&
                          Boolean(formik.errors.last_name)
                        }
                        helperText={
                          formik.touched.last_name &&
                            typeof formik.errors.last_name === "string"
                            ? formik.errors.last_name
                            : undefined
                        }
                        fullWidth
                        size="small"
                      />
                    </motion.div>

                    <motion.div variants={itemAnimation}>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="info@gmail.com"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.email && Boolean(formik.errors.email)
                        }
                        helperText={
                          formik.touched.email &&
                            typeof formik.errors.email === "string"
                            ? formik.errors.email
                            : undefined
                        }
                        disabled
                        fullWidth
                        size="small"
                      />
                    </motion.div>

                    <motion.div variants={itemAnimation}>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="1234567890"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.phone && Boolean(formik.errors.phone)
                        }
                        helperText={
                          formik.touched.phone &&
                            typeof formik.errors.phone === "string"
                            ? formik.errors.phone
                            : undefined
                        }
                        fullWidth
                        size="small"
                      />
                    </motion.div>

                    <motion.div variants={itemAnimation}>
                      <Label>Gender</Label>
                      <FormGroup row>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formik.values.gender === "male"}
                              onChange={() => handleGenderChange("male")}
                              name="male"
                              color="primary"
                            />
                          }
                          label="Male"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formik.values.gender === "female"}
                              onChange={() => handleGenderChange("female")}
                              name="female"
                              color="primary"
                            />
                          }
                          label="Female"
                        />
                      </FormGroup>
                      {formik.touched.gender && formik.errors.gender && (
                        <p className="text-red-500 text-xs mt-1">
                          {formik.errors.gender as string}
                        </p>
                      )}
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div
                className="flex items-center justify-end gap-3 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={closeModal}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="px-6"
                  disabled={formik.isSubmitting || !formik.dirty}
                >
                  {formik.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </Box>
      </Modal>
    </>
  );
}


