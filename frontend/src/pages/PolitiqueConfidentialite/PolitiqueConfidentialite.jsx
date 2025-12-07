import styles from './PolitiqueConfidentialite.module.scss';

const PolitiqueConfidentialite = () => {
  return (
    <div className={styles.politiqueConfidentialite}>
      <section className={`container ${styles.main}`}>
          <h1>Politique de Confidentialité</h1>
          
          <section className={styles.section}>
            <h2>Collecte des données personnelles</h2>
            <p>
              Nous collectons des informations lorsque vous vous inscrivez sur notre site, 
              passez une commande ou remplissez un formulaire. Les informations collectées 
              incluent votre nom, votre adresse e-mail, votre numéro de téléphone et/ou 
              votre adresse de livraison.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Utilisation des données</h2>
            <p>
              Les informations que nous collectons ne seront pas utilisé à des fins de marketing,
              but only for processing your orders.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Protection des données</h2>
            <p>
              Nous mettons en œuvre une variété de mesures de sécurité pour préserver 
              la sécurité de vos informations personnelles. Nous utilisons un cryptage 
              avancé pour protéger les informations sensibles transmises en ligne.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Cookies</h2>
            <p>
              Nous utilisons des cookies pour améliorer votre expérience.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, 
              de portabilité et d'effacement de vos données personnelles. Vous pouvez 
              également vous opposer au traitement de vos données personnelles.
            </p>
          </section>
      </section>
    </div>
  );
};

export default PolitiqueConfidentialite;
