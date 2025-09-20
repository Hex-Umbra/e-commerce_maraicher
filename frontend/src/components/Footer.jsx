export default function Footer() {
  return (
    <footer className="site-footer">
      {" "}
      <div className="container footer__grid">
        {" "}
        <div className="footer__block">
          {" "}
          <h4>Marché Frais Fermier</h4>{" "}
          <p>
            {" "}
            Votre plateforme de confiance pour des produits frais et locaux
            directement de nos fermiers partenaires.{" "}
          </p>{" "}
        </div>{" "}
        <div className="footer__block">
          <h4>Liens rapides</h4>
          <ul>
            <li>
              <a href="#">Accueil</a>
            </li>
            <li>
              <a href="#">Fermiers</a>
            </li>
            <li>
              <a href="#">Produits</a>
            </li>
            <li>
              <a href="#">À Propos</a>
            </li>
          </ul>
        </div>
        <div className="footer__block">
          <h4>Support</h4>
          <ul>
            <li>
              <a href="#">Contact</a>
            </li>
          </ul>
        </div>
        <div className="footer__copyright">
          <p>
            © 2024 Marché Fermier Frais.
            <br />
            Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
