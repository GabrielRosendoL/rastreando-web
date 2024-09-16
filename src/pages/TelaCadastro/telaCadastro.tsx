import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase-config';
import styles from './telaCadastro.styles.module.css';

const TelaCadastro: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      
      // Adicionar o usuário ao Firestore com o uid como ID do documento
      await setDoc(doc(db, 'administradores', user.uid), {
        email: user.email,
        nome,
      });

      // Redirecionar para a tela de login
      navigate('/telaLogin');
    } catch (error) {
      setError('Erro ao criar conta: ' + (error as any).message);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Cadastre-se
      </h1>
      <form onSubmit={handleSignUp}>
        <div className={styles.formGroup}>
          <label>Nome:</label>
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            placeholder="Email"
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
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <button type="submit" className={styles.btn}>Cadastrar</button>
      </form>
    </div>
  );
};

export default TelaCadastro;