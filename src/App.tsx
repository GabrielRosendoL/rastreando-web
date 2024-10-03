import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import EditarIndicacoesRastreio from './pages/IndicacoesRastreio/editarIndicacoesRastreio';
import IndicacoesRastreio from './pages/IndicacoesRastreio/indicacoesRastreio';
import EditarSinaisAlarmeFatoresRisco from './pages/SinaisAlarmeFatoresRisco/editarSinaisAlarmeFatoresRisco';
import SinaisAlarmeFatoresRisco from './pages/SinaisAlarmeFatoresRisco/sinaisAlarmeFatoresRisco';
import EditarSinaisSintomas from './pages/SinaisSintomas/editarSinaisSintomas';
import SinaisSintomas from './pages/SinaisSintomas/sinaisSintomas';
import TelaCadastro from './pages/TelaCadastro/telaCadastro';
import TelaGerenciamento from './pages/TelaGerenciamento/telaGerenciamento';
import TelaLogin from './pages/TelaLogin/telaLogin';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/*" element={<TelaLogin />} />
            <Route path="/telaCadastro" element={<TelaCadastro />} />
            <Route path="/telaLogin" element={<TelaLogin />} />
            <Route path="/telaGerenciamento" element={<TelaGerenciamento />} />
            <Route path="/sinaisSintomas" element={<SinaisSintomas />} />
            <Route path="/sinaisAlarmeFatoresRisco" element={<SinaisAlarmeFatoresRisco />} />
            <Route path="/indicacoesRastreio" element={<IndicacoesRastreio />} />
            <Route path="/editarIndicacoesRastreio" element={<EditarIndicacoesRastreio />} />
            <Route path="/editarSinaisAlarmeFatoresRisco" element={<EditarSinaisAlarmeFatoresRisco />} />
            <Route path="/editarSinaisSintomas" element={<EditarSinaisSintomas />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
