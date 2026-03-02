import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiClient } from '../api/client';

function DashboardPage() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      if (user?.role !== 'admin') {
        return;
      }

      setLoading(true);
      setError('');
      try {
        const { data } = await apiClient.get('/users');
        setUsers(data.users || data || []);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [user?.role]);

  return (
    <main className="dashboard-wrapper">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Signed in as <strong>{user?.email || 'unknown user'}</strong> ({user?.role || 'user'})</p>
        </div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </header>

      <section className="dashboard-panel">
        <h2>Session status</h2>
        <p>Access token is stored in memory only and renewed silently using refresh token rotation.</p>
      </section>

      {user?.role === 'admin' ? (
        <section className="dashboard-panel">
          <h2>All users</h2>
          {loading && <p>Loading users...</p>}
          {error && <p className="error-text">{error}</p>}
          {!loading && !error && (
            <ul className="user-list">
              {users.map((item) => (
                <li key={item.id || item.email}>
                  <span>{item.name || item.email}</span>
                  <span className="badge">{item.role}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="dashboard-panel">
          <h2>Standard user</h2>
          <p>Your role does not allow listing all users.</p>
        </section>
      )}
    </main>
  );
}

export default DashboardPage;
