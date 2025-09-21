import { Link } from 'react-router-dom';
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
            <li><Link to="/accueil">Accueil</Link></li>
            <li><Link to="/nosfermiers">Fermiers</Link></li>
            <li><Link to="/produits">Produits</Link></li>
            <li><Link to="/apropos">À Propos</Link></li>
          </ul>
        </nav>

        <nav className={styles.support}>
          <h3>Support</h3>
          <ul>
            <li><Link to="/contact">Contact</Link></li>
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
