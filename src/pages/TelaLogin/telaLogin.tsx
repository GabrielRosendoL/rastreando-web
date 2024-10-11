import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase-config';
import { useAuth } from '../../context/AuthContext';
import styles from './telaLogin.styles.module.css';

const TelaLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const authContext = useAuth();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      authContext?.login(); 
      navigate('/telaGerenciamento');
    } catch (error) {
      setError('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  const handleCadastro = () => {
    navigate('/telaCadastro');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <span className={styles.rastreando}>Rastreando</span> <span className={styles.app}>WEB</span>
      </h1>
      <form onSubmit={handleLogin}>
        <div className={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <button type="submit" className={styles.btn}>Entrar</button>
      </form>
      <button onClick={handleCadastro} className={styles.btnCadastro}>Cadastrar</button>
    </div>
  );
};

export default TelaLogin;
