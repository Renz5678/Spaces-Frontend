import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import MatrixInput from './components/MatrixInput';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth, useMatrix, useSavedMatrices } from './hooks';
import './App.css';
import './components/LoadingPlaceholder.css';
import './components/HeaderResponsive.css';

const ResultsDisplay = lazy(() => import('./components/ResultsDisplay'));
const SavedMatricesPage = lazy(() => import('./components/SavedMatricesPage').then(module => ({ default: module.SavedMatricesPage })));

function App() {
  const location = useLocation();

  // Custom hooks for business logic
  const {
    user,
    showAuth,
    setShowAuth,
    authMode,
    setAuthMode,
    authForm,
    setAuthForm,
    authError,
    setAuthError,
    authLoading,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleAuth,
    openAuthModal,
    handleForgotPassword,
    handleLogout,
    passwordsMatch,
    passwordsMismatch,
    isConfigured: isSupabaseConfigured,
  } = useAuth();

  const {
    results,
    isLoading,
    error,
    examples,
    handleCompute,
  } = useMatrix();

  const {
    savedMatrices,
    showSaveModal,
    saveMatrixName,
    setSaveMatrixName,
    saveLoading,
    saveError,
    fetchSavedMatrices,
    openSaveModal,
    closeSaveModal,
    saveMatrix,
    loadMatrix,
    deleteMatrix,
    updateMatrix,
    clearSavedMatrices,
  } = useSavedMatrices(user, handleCompute);

  // Fetch saved matrices when user logs in
  useEffect(() => {
    if (user) {
      fetchSavedMatrices(user.id);
    } else {
      clearSavedMatrices();
    }
  }, [user, fetchSavedMatrices, clearSavedMatrices]);

  // Handle auth success callback
  const onAuthSuccess = (loggedInUser) => {
    fetchSavedMatrices(loggedInUser.id);
  };

  // Handle logout with cleanup
  const onLogout = async () => {
    await handleLogout();
    clearSavedMatrices();
  };

  return (
    <div className="app">
      <div className="background-gradient"></div>

      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo-link">
            <div className="logo">
              <span className="logo-icon">[⊞]</span>
              <h1>SPACES</h1>
            </div>
          </Link>
          <p className="tagline">Explore the Four Fundamental Subspaces</p>
        </div>

        <nav className="header-nav">
          {user && (
            <>
              <Link
                to="/"
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                Calculator
              </Link>
              <Link
                to="/saved"
                className={`nav-link ${location.pathname === '/saved' ? 'active' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Saved
                {savedMatrices.length > 0 && (
                  <span className="nav-badge">{savedMatrices.length}</span>
                )}
              </Link>
            </>
          )}
        </nav>

        {isSupabaseConfigured && (
          <div className="auth-section">
            {user ? (
              <div className="user-info">
                <span className="user-email">{user.email}</span>
                <button onClick={onLogout} className="btn-auth btn-logout">Logout</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button onClick={() => openAuthModal('login')} className="btn-auth">
                  Log In
                </button>
                <button onClick={() => openAuthModal('signup')} className="btn-auth">
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <Routes>
        <Route path="/" element={
          <main className="main-content">
            <section className="input-section">
              <h2>Enter Your Matrix</h2>
              <p className="subtitle">Dimensions up to 5×5 • Supports fractions (1/2) and decimals</p>
              <MatrixInput
                onCompute={handleCompute}
                isLoading={isLoading}
                examples={examples}
              />
            </section>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}

            {results && (
              <>
                <Suspense fallback={<div className="loading-placeholder">Loading results...</div>}>
                  <ResultsDisplay results={results} />
                </Suspense>
                {user && (
                  <div className="save-section">
                    <button onClick={openSaveModal} className="btn btn-save">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Save Matrix
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        } />

        <Route path="/saved" element={
          <ProtectedRoute user={user}>
            <Suspense fallback={<div className="loading-placeholder">Loading saved matrices...</div>}>
              <SavedMatricesPage
                savedMatrices={savedMatrices}
                loadMatrix={loadMatrix}
                deleteMatrix={deleteMatrix}
                updateMatrix={updateMatrix}
                handleCompute={handleCompute}
                isLoading={isLoading}
                user={user}
              />
            </Suspense>
          </ProtectedRoute>
        } />
      </Routes>

      <footer className="app-footer">
        <p>© 2025 Fundamental Subspaces Calculator</p>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAuth(false)}>×</button>
            <h2>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="modal-subtitle">
              {authMode === 'login'
                ? 'Sign in to save and manage your matrices'
                : 'Sign up to save your matrix calculations'}
            </p>

            {authError && (
              <div className="auth-error">
                {authError}
              </div>
            )}

            <form onSubmit={(e) => handleAuth(e, onAuthSuccess)}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={authMode === 'signup' ? 'Create a password (min 6 characters)' : 'Enter your password'}
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                    minLength={authMode === 'signup' ? 6 : undefined}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {authMode === 'login' && (
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {authMode === 'signup' && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={authForm.confirmPassword}
                      onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                      required
                      className={passwordsMismatch ? 'input-error' : passwordsMatch ? 'input-success' : ''}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {authForm.confirmPassword && (
                    <div className={`password-match-indicator ${passwordsMatch ? 'match' : 'no-match'}`}>
                      {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </div>
                  )}
                </div>
              )}

              <button type="submit" className="btn-submit" disabled={authLoading}>
                {authLoading ? (
                  <span className="btn-loading">
                    <svg className="spinner" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round" />
                    </svg>
                    {authMode === 'login' ? 'Logging in...' : 'Creating account...'}
                  </span>
                ) : (
                  authMode === 'login' ? 'Log In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <p className="auth-toggle">
              {authMode === 'login' ? (
                <>Don't have an account? <button onClick={() => { setAuthMode('signup'); setAuthError(''); }}>Sign Up</button></>
              ) : (
                <>Already have an account? <button onClick={() => { setAuthMode('login'); setAuthError(''); }}>Log In</button></>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Save Matrix Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={closeSaveModal}>
          <div className="modal save-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeSaveModal}>×</button>
            <h2>Save Matrix</h2>
            <p className="modal-subtitle">Give your matrix a name to save it for later</p>

            {saveError && (
              <div className="auth-error">
                {saveError}
              </div>
            )}

            <form onSubmit={(e) => saveMatrix(e, results)}>
              <div className="form-group">
                <label htmlFor="matrixName">Matrix Name</label>
                <input
                  id="matrixName"
                  type="text"
                  placeholder="e.g., Homework Problem 3"
                  value={saveMatrixName}
                  onChange={(e) => setSaveMatrixName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeSaveModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={saveLoading}>
                  {saveLoading ? (
                    <span className="btn-loading">
                      <svg className="spinner" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Matrix'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
