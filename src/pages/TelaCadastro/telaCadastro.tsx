import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { auth, db } from '../../config/firebase-config';
import styles from './telaCadastro.styles.module.css';

const TelaCadastro: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Adicionar o usuário ao Firestore
      await addDoc(collection(db, 'administradores'), {
        uid: user.uid,
        email: user.email,
        name,
      });

      // Redirecionar ou mostrar uma mensagem de sucesso
      alert('Cadastro realizado com sucesso!');
    } catch (error) {
      setError('Erro ao criar conta: ' + (error as any).message);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Cadastro</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <button type="submit">Cadastrar</button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

export default TelaCadastro;
