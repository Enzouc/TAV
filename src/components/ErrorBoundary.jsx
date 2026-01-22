import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 text-center">
          <div className="alert alert-danger">
            <h1 className="display-4">Algo salió mal 😢</h1>
            <p className="lead">Ha ocurrido un error inesperado en la aplicación.</p>
            {this.state.error && (
              <details className="mt-3 text-start bg-light p-3 rounded">
                <summary className="mb-2">Detalles del error (para soporte técnico)</summary>
                <pre className="text-danger small mb-0">
                  {this.state.error.toString()}
                  <br />
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button 
              className="btn btn-primary mt-4" 
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
