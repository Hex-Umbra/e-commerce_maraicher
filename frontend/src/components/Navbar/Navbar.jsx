import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/useCart";
import Notification from "../Notification/Notification";
import styles from "./Navbar.module.scss";
import { NAV_LINKS, ROUTES } from "../../utils/routes";
import { BsCart3 } from "react-icons/bs";
import { FiPackage } from "react-icons/fi";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut, notification, hideNotification } = useAuth();
  const { cartCount } = useCart();
  
  // Ref for detecting clicks outside the menu
  const navRef = useRef(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // UX Upgrade: Close menu when clicking outside component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target) && isMenuOpen) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // UX Upgrade: Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      closeMenu();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className={styles.navbar}>
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
      
      {/* SEMANTIC FIX: Changed outer nav to div */}
      <div className={`container ${styles.navbarContainer}`}>
        <span className={styles.logo}>
          <Link to={ROUTES.accueil} onClick={closeMenu}>Marché Frais Fermier</Link>
        </span>

        {/* A11Y FIX: Added aria-expanded and aria-controls */}
        <button
          className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerOpen : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>

        {/* Navigation Links Wrapper */}
        <nav
          id="primary-navigation"
          ref={navRef}
          className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ""}`}
          aria-label="Main Navigation"
        >
          <ul className={styles.navSection}>
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                  onClick={closeMenu}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <ul className={styles.authSection}>
            {!isAuthenticated && (
              <>
                <li>
                  <NavLink
                    to={ROUTES.login}
                    className={({ isActive }) => `${styles.authLink} ${isActive ? styles.active : ""}`}
                    onClick={closeMenu}
                  >
                    Connexion
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to={ROUTES.register}
                    className={({ isActive }) => `${styles.authLink} ${styles.signupLink} ${isActive ? styles.active : ""}`}
                    onClick={closeMenu}
                  >
                    S'inscrire
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* User Section (Icons) - Kept outside nav for direct access */}
        <div className={styles.userSection}>
          {isAuthenticated ? (
            <ul className={styles.userInfo}>
              <li>
                <Link
                  to={ROUTES.profile}
                  className={styles.userIcon}
                  onClick={closeMenu}
                  aria-label="Aller à mon profil"
                >
                  {/* UX FIX: Hide name on small screens in CSS, but keep logic simple here */}
                  <span className={styles.userName}>{user?.name}</span>
                  <div className={styles.profileIcon} aria-hidden="true">👤</div>
                </Link>
              </li>
              
              <li>
                {user?.role === "producteur" ? (
                  <Link to={ROUTES.orders} className={styles.ordersButton} aria-label="Voir les commandes">
                    <FiPackage />
                  </Link>
                ) : (
                  <Link to={ROUTES.cart} className={styles.cartButton} aria-label={`Voir le panier, ${cartCount} articles`}>
                    <BsCart3 />
                    {cartCount > 0 && (
                      <span className={styles.cartBadge}>{cartCount}</span>
                    )}
                  </Link>
                )}
              </li>
              
              <li>
                <button 
                  className={styles.logoutButton}
                  onClick={handleLogout}
                >
                  Déconnexion
                </button>
              </li>
            </ul>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Navbar;