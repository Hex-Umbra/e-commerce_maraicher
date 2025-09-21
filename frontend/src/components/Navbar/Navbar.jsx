import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import Notification from "../Notification/Notification";
import styles from "./Navbar.module.scss";
import { NAV_LINKS, ROUTES } from "../../utils/routes";
import { BsCart3 } from "react-icons/bs";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut, notification, hideNotification } = useAuth();
  const { cartCount } = useCart();
  // Using NavLink to handle active state; location not required


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      closeMenu(); // Close mobile menu if open
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className={styles.navbar}>
      {/* Notification */}
      {notification && (
        <div className={styles.notificationContainer}>
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={hideNotification}
            isVisible={notification.isVisible}
          />
        </div>
      )}
      
      <div className={`container ${styles.navbarContainer}`}>
        <h1 className={styles.logo}>
          <Link to={ROUTES.accueil} onClick={closeMenu}>Marché Frais Fermier</Link>
        </h1>


        {/* Hamburger Button */}
        <button
          className={`${styles.hamburger} ${
            isMenuOpen ? styles.hamburgerOpen : ""
          }`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <nav
          className={`${styles.navLinks} ${
            isMenuOpen ? styles.navLinksOpen : ""
          }`}
        >
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
              onClick={closeMenu}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className={styles.userSection}>
          {isAuthenticated ? (
            <div className={styles.userInfo}>
              <div className={styles.userIcon}>
                <span className={styles.userName}>{user?.name}</span>
                <div className={styles.profileIcon}>👤</div>
              </div>
              <Link
                to={ROUTES.cart}
                className={styles.cartButton}
                aria-label="Voir le panier"
                onClick={closeMenu}
                title="Panier"
              >
                <BsCart3 aria-hidden="true" />
                {cartCount > 0 && (
                  <span
                    className={styles.cartBadge}
                    aria-label={`${cartCount} article(s) dans le panier`}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
              <button 
                className={styles.logoutButton}
                onClick={handleLogout}
                aria-label="Se déconnecter"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <NavLink 
                to={ROUTES.login} 
                className={({ isActive }) => `${styles.authLink} ${isActive ? styles.active : ""}`}
                onClick={closeMenu}
              >
                Connexion
              </NavLink>
              <NavLink 
                to={ROUTES.register} 
                className={({ isActive }) => `${styles.authLink} ${styles.signupLink} ${isActive ? styles.active : ""}`}
                onClick={closeMenu}
              >
                S'inscrire
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
