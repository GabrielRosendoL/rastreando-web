import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Certifique-se de estar usando react-router-dom
import { auth } from '../../config/firebase-config';
import styles from './telaLogin.styles.module.css';

const TelaLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<any>('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirecionar para TelaGerenciamento após o login
      alert('Login realizado com sucesso!');
      navigate('/telaGerenciamento'); // Alterado para TelaGerenciamento
    } catch (error) {
      setError('Erro ao fazer login: ' + (error as any).message);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Por favor, insira seu email para redefinir a senha.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Email de redefinição de senha enviado!');
    } catch (error) {
      setError('Erro ao redefinir senha: ' + (error as any).message);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
      <div className={styles.options}>
        <button onClick={() => navigate('/telaCadastro')} className={styles.optionButton}>Cadastrar</button>
        <button onClick={handlePasswordReset} className={styles.optionButton}>Esqueci minha senha</button>
      </div>
    </div>
  );
};

export default TelaLogin;
