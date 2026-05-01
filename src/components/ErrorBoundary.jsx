import React from 'react';

/**
 * ErrorBoundary simples para evitar que um erro de render em um filho
 * derrube todo o App (header/tabs incluídos). Mostra uma UI mínima
 * com botão para tentar novamente.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // log no console para debug
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    // Reseta o erro quando a chave de reset muda (ex.: troca de aba)
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  handleRetry = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl ring-1 ring-rose-500/30 bg-rose-950/30 p-6 text-center">
          <div className="text-rose-300 font-bold mb-2">Algo deu errado ao renderizar esta seção.</div>
          <div className="text-xs text-stone-400 mb-4 break-words">
            {String(this.state.error?.message || this.state.error)}
          </div>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 rounded-lg bg-amber-400 text-stone-950 text-sm font-bold hover:bg-amber-300 transition"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
