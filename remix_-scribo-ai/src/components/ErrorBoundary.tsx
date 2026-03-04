import React from 'react';

interface State { hasError: boolean; error: any; }

export default class ErrorBoundary 
  extends React.Component<
    {children: React.ReactNode}, State
  > {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          padding: 24,
          background: '#FFF8F4'
        }}>
          <div style={{fontSize: 48, marginBottom: 16}}>
            ⚠️
          </div>
          <h2 style={{
            color: '#FF9A6C',
            marginBottom: 8
          }}>Something went wrong</h2>
          <p style={{
            color: '#999',
            marginBottom: 24,
            textAlign: 'center'
          }}>
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg,#FF9A6C,#FFC87A)',
              border: 'none',
              borderRadius: 50,
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
