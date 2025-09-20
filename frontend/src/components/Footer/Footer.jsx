import styles from './Footer.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.about}>
          <h3>Marché Frais Fermier</h3>
          <p>Votre plateforme de confiance pour des produits frais et locaux directement de nos fermiers partenaires.</p>
        </div>

        <nav className={styles.quickLinks}>
          <h3>Liens rapides</h3>
          <ul>
            <li><a href="#accueil">Accueil</a></li>
            <li><a href="#fermiers">Fermiers</a></li>
            <li><a href="#produits">Produits</a></li>
            <li><a href="#apropos">À Propos</a></li>
          </ul>
        </nav>

        <nav className={styles.support}>
          <h3>Support</h3>
          <ul>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>

        <div className={styles.copyright}>
          <p><em>© 2024 Marché Fermier Frais.<br/>Tous droits réservés.</em></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;