import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import styles from './AdminComments.module.scss';

const AdminComments = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const data = await adminAPI.getAllComments();
                setComments(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.comments}>
            <h1>Comments Management</h1>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Producer</th>
                        <th>Comment</th>
                        <th>Rating</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {comments.map((comment) => (
                        <tr key={comment._id}>
                            <td>{comment._id}</td>
                            <td>{comment.userId.name}</td>
                            <td>{comment.ProducteurId.name}</td>
                            <td>{comment.comment}</td>
                            <td>{comment.rating}</td>
                            <td>
                                <button className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminComments;
