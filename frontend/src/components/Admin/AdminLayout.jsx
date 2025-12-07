import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import styles from './AdminLayout.module.scss';

const AdminLayout = () => {
    return (
        <div className={styles.adminLayout}>
            <AdminSidebar />
            <main className={styles.adminContent}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
