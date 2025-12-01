import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FormField from "../common/FormField";
import styles from "./WelcomeSection.module.scss";

const WelcomeSection = () => {
  const { signUp, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Handle input changes
  const handleFieldChange = (fieldName) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear specific field error
    if (formErrors[fieldName]) {
      setFormErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }

    // Clear general error
    if (error) {
      clearError();
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!formData.name.trim()) {
      errors.name = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }

    if (!formData.address.trim()) {
      errors.address = "L'adresse est requise";
    }

    if (!formData.password) {
      errors.password = "Le mot de passe est requis";
    } else if (!passwordRegex.test(formData.password)) {
      errors.password =
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Veuillez confirmer votre mot de passe";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    clearError();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Clear form errors
    setFormErrors({});

    // Prepare data for API (exclude confirmPassword)
    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...signUpData } = formData;

    try {
      const result = await signUp(signUpData);

      if (result.success) {
        // Reset form
        setFormData({
          name: "",
          email: "",
          address: "",
          password: "",
          confirmPassword: "",
        });
        // Navigate to homepage immediately
        navigate("/accueil");
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  return (
    <section className={styles.welcomeSection}>
      <div className={`container ${styles.contentWrapper}`}>
        <div className={styles.welcomeText}>
          <h2>
            <em>Bienvenue !</em>
          </h2>
          <p>Rejoignez notre site et faite partie de la communauté !</p>
        </div>
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          {/* General Error Message */}
          {error && <div className={styles.errorMessage}>{error}</div>}

          <FormField
            id="name"
            label="Nom et prénom"
            type="text"
            value={formData.name}
            onChange={handleFieldChange('name')}
            placeholder="Nom et prénom"
            error={formErrors.name}
            required
            disabled={loading}
          />

          <FormField
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleFieldChange('email')}
            placeholder="Votre email"
            error={formErrors.email}
            required
            disabled={loading}
          />

          <FormField
            id="address"
            label="Adresse"
            type="text"
            value={formData.address}
            onChange={handleFieldChange('address')}
            placeholder="Votre adresse"
            error={formErrors.address}
            required
            disabled={loading}
          />

          <FormField
            id="password"
            label="Mot de Passe"
            type="password"
            value={formData.password}
            onChange={handleFieldChange('password')}
            placeholder="Votre mot de passe"
            error={formErrors.password}
            required
            disabled={loading}
          />

          <FormField
            id="confirmPassword"
            label="Confirmer le mot de passe"
            type="password"
            value={formData.confirmPassword}
            onChange={handleFieldChange('confirmPassword')}
            placeholder="Confirmez votre mot de passe"
            error={formErrors.confirmPassword}
            required
            disabled={loading}
          />

          <button
            type="submit"
            className={`${styles.submitBtn} ${
              loading ? styles.submitBtnLoading : ""
            }`}
            disabled={loading}
          >
            {loading ? "Inscription en cours..." : "Inscription"}
          </button>
        </form>
      </div>
    </section>
  );
};

// PropTypes validation
WelcomeSection.propTypes = {
  // Currently no props are passed to this component
  // Adding this for future-proofing and consistency
};

export default WelcomeSection;
