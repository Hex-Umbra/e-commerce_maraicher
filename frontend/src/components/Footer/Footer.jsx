import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/routes';
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
            <li><Link to={ROUTES.accueil}>Accueil</Link></li>
            <li><Link to={ROUTES.nosFermiers}>Fermiers</Link></li>
            <li><Link to={ROUTES.produits}>Produits</Link></li>
            <li><Link to={ROUTES.apropos}>À Propos</Link></li>
          </ul>
        </nav>

        <nav className={styles.support}>
          <h3>Support</h3>
          <ul>
            <li><Link to={ROUTES.contact}>Contact</Link></li>
            <li><Link to={ROUTES.mentionsLegales}>Mentions légales</Link></li>
            <li><Link to={ROUTES.politiqueConfidentialite}>Politique de confidentialité</Link></li>
            <li><Link to={ROUTES.conditionsUtilisation}>Conditions d'utilisation</Link></li>
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
