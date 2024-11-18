import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useState, useEffect, /* FormEvent, */ ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconifyIcon from 'components/base/IconifyIcon';
import axios from 'axios';
import { Button } from '@mui/material';
import TransactionHistoryTable from './TransactionHistoryTable';
import { GridRowId } from '@mui/x-data-grid';

// Interface para os dados da API
interface PagamentoData {
  id: number;
  nomePagador: string;
  nomeBanco: string;
  data: string;
  hora: string;
  valor: number;
}

interface Transaction {
  id: number;
  nomePagador: string;
  nomeBanco: string;
  data: string;
  hora: string;
  valor: number;
}

const TransactionHistory = () => {
  const [searchText, setSearchText] = useState('');
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]); // Estado para armazenar as transações
  const [selectedIds, setSelectedIds] = useState<GridRowId[]>([]); // IDs dos itens selecionados para remoção
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');

  // Fetch para obter dados ao carregar a página
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get<PagamentoData[]>('http://localhost:8080/api/pagamentos');
        const mappedTransactions = response.data.map((item: PagamentoData): Transaction => ({
          id: item.id,
          nomePagador: item.nomePagador,
          nomeBanco: item.nomeBanco,
          data: item.data,
          hora: item.hora,
          valor: item.valor,
        }));
        setTransactions(mappedTransactions);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
      }
    };

    fetchTransactions();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFileUpload(file);
    if (file) setModalOpen(true);
  
  };
  
  // Post para enviar arquivos
  /* const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); */
    const handleUpload = async () => {
    if (!fileUpload || !selectedBank) {
      alert('Selecione um arquivo e um banco antes de enviar.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileUpload);
    formData.append('banco', selectedBank);

    try {
      await axios.post('http://localhost:8080/api/pagamentos/upload', formData); {
        alert('Arquivo enviado com sucesso!');
        setModalOpen(false);
        window.location.reload();
      };
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao enviar o arquivo.');
    }
  };

  const handleCancel = () => {
    setFileUpload(null);
    setSelectedBank('');
    setModalOpen(false);
  };

  // Delete para remover itens selecionados
  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      alert('Selecione ao menos uma transação para excluir.');
      return;
    }

    try {
      await Promise.all(
        selectedIds.map((id) =>
          axios.delete(`http://localhost:8080/api/pagamentos/${id}`)
        )
      );
      alert('Transações removidas com sucesso!');
      window.location.reload();
    } catch (error) {
      console.error('Erro ao remover transações:', error);
      alert('Erro ao remover transações.');
    }
  };

  return (
    <Paper sx={{ px: 0, height: { xs: 442, sm: 396 } }}>
      <Stack
        px={3.5}
        spacing={{ xs: 2, sm: 0 }}
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="h4" minWidth={200}>
          Lista de Comprovantes
        </Typography>
        <form /* onSubmit={handleUpload} */>
          <Button variant="contained" component="label">
            Selecionar arquivo
            <input type="file" hidden onChange={handleFileChange} />
            {/* <input
              type="file"
              hidden
              onChange={(e) =>
                setFileUpload(e.target.files ? e.target.files[0] : null)
              }
            />
          </Button>
          <Button type="submit" variant="contained" color="secondary">
            Enviar */}
          </Button>
        </form>
        <TextField
          variant="filled"
          size="small"
          placeholder="Pesquise aqui"
          value={searchText}
          onChange={handleInputChange}
          sx={{ width: 1, maxWidth: 250 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconifyIcon icon="eva:search-fill" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <Box mt={1.5} height={314}>
        <TransactionHistoryTable
          searchText={searchText}
          transactions={transactions}
          onDelete={handleDelete}
          //onDelete={() => {}}
          onSelectionChange={setSelectedIds}
        />
      </Box>

      {/* Modal */}
      <Dialog open={modalOpen} onClose={handleCancel}>
        <DialogTitle>Escolha o Banco</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel id="bank-select-label">Banco</InputLabel>
            <Select
              labelId="bank-select-label"
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
            >
              <MenuItem value="Bradesco">Bradesco</MenuItem>
              <MenuItem value="Santander">Santander</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            color="primary"
            disabled={!selectedBank}
          >
            Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TransactionHistory;
