import { useState } from "react";
import FormField from "../../components/common/FormField";
import SEO from "../../components/SEO";
import { supportAPI } from "../../services/api";
import { useLocation } from "react-router-dom";
import styles from "./Contact.module.scss";

const Contact = () => {
  const location = useLocation();
  const prefillSubject = new URLSearchParams(location.search).get("subject") || "";
  const [subject, setSubject] = useState(prefillSubject);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!subject.trim() || !title.trim() || !message.trim()) {
      setErrorMsg("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      await supportAPI.sendContact({
        subject: subject.trim(),
        title: title.trim(),
        message: message.trim(),
      });
      setSuccessMsg("Votre message a été envoyé au support.");
      setSubject("");
      setTitle("");
      setMessage("");
    } catch (err) {
      setErrorMsg(err.message || "Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.contactSection}>
      <SEO
        title="Nous Contacter"
        description="Une question, un problème ou un retour à nous transmettre ? Contactez notre équipe de support. Nous vous répondrons dans les plus brefs délais."
        keywords="contact, support, aide, service client, nous contacter"
        canonical="https://mff-weld.vercel.app/contact"
        ogType="website"
      />
      <div className={`container ${styles.contentWrapper}`}>
        <form className={styles.formContainer} onSubmit={handleSubmit} noValidate>
          <FormField
            id="subject"
            label="Objet"
            type="text"
            value={subject}
            onChange={setSubject}
            placeholder="Sujet de votre demande"
            required
            disabled={loading}
          />

          <FormField
            id="title"
            label="Titre"
            type="text"
            value={title}
            onChange={setTitle}
            placeholder="Titre du message"
            required
            disabled={loading}
          />

          <FormField
            id="message"
            label="Message"
            type="textarea"
            value={message}
            onChange={setMessage}
            placeholder="Décrivez votre demande..."
            required
            rows={5}
            disabled={loading}
          />

          {successMsg && (
            <div className={styles.successMessage}>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className={styles.errorMessage}>{errorMsg}</div>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className={`${styles.submitBtn} ${loading ? styles.submitBtnLoading : ""}`}
              disabled={loading}
            >
              {loading ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </form>

        <div className={styles.infoText}>
          <h2>
            <em>Nous contacter</em>
          </h2>
          <p>
            Une question, un problème ou un retour à nous transmettre ? Utilisez
            ce formulaire pour joindre notre support. Nous vous répondrons dans
            les plus brefs délais.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
