import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import styles from './AdminComments.module.scss';

const AdminComments = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchComments = async () => {
        try {
            const data = await adminAPI.getAllComments();
            console.log('Comments response:', data);
            setComments(data.data || []);
        } catch (err) {
            console.error('Comments error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await adminAPI.deleteComment(commentId);
                alert('Comment deleted successfully!');
                fetchComments(); // Refresh the list
            } catch (err) {
                setError(err.message);
                alert(`Error deleting comment: ${err.message}`);
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.comments}>
            <h1>Comments Management</h1>
            {comments.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No comments found.</p>
                </div>
            ) : (
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
                                <td>{comment.userId?.name || 'N/A'}</td>
                                <td>{comment.ProducteurId?.name || 'N/A'}</td>
                                <td>{comment.comment}</td>
                                <td>{comment.rating}</td>
                            <td>
                                <button
                                    className={`${styles.button} ${styles.deleteButton}`}
                                    onClick={() => handleDeleteComment(comment._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            )}
        </div>
    );
};

export default AdminComments;
