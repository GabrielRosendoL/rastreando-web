import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import CondutaManejoResultado from './pages/CondutaManejoResultado/condutaManejoResultado';
import IndicacoesRastreio from './pages/IndicacoesRastreio/indicacoesRastreio';
import MarqueConsulta from './pages/MarqueConsulta/marqueConsulta';
import EditarSinaisAlarmeFatoresRisco from './pages/SinaisAlarmeFatoresRisco/editarSinaisAlarmeFatoresRisco';
import SinaisAlarmeFatoresRisco from './pages/SinaisAlarmeFatoresRisco/sinaisAlarmeFatoresRisco';
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
            <Route path="/marqueConsulta" element={<MarqueConsulta />} />
            <Route path="/condutaManejoResultado" element={<CondutaManejoResultado />} />
            <Route path="/editarSinaisAlarmeFatoresRisco" element={<EditarSinaisAlarmeFatoresRisco />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
