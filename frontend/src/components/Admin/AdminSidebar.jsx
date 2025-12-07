import { NavLink } from 'react-router-dom';
import styles from './AdminSidebar.module.scss';

const AdminSidebar = () => {
    return (
        <aside className={styles.sidebar}>
            <nav className={styles.nav}>
                <h2>Admin Menu</h2>
                <ul>
                    <li>
                        <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? styles.active : '')}>
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/users" className={({ isActive }) => (isActive ? styles.active : '')}>
                            Users
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/products" className={({ isActive }) => (isActive ? styles.active : '')}>
                            Products
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? styles.active : '')}>
                            Orders
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/comments" className={({ isActive }) => (isActive ? styles.active : '')}>
                            Comments
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default AdminSidebar;
