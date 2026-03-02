import { Link } from 'react-router-dom';

function AuthLayout({ title, subtitle, children, altLinkText, altLinkTo, altLinkLabel }) {
  return (
    <main className="auth-wrapper">
      <section className="auth-card">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
        <div className="auth-footer">
          {altLinkText} <Link to={altLinkTo}>{altLinkLabel}</Link>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
