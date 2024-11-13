import { useState, ChangeEvent, FormEvent } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconifyIcon from 'components/base/IconifyIcon';
import TransactionHistoryTable from './TransactionHistoryTable';

const TransactionHistory = () => {
  const [searchText, setSearchText] = useState('');
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const fetchData = async (formData: FormData) => {
    
    try {
      const response = await fetch('http://localhost:8080/api/pagamentos/upload', {
        method: 'POST',
        body: formData, // Envia o FormData
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.text();
      console.log(data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(fileUpload){      
      const formData=new FormData(e.currentTarget);
      await fetchData(formData)
    }
    else {
      console.log("Deu Merda")      
    }
  }
  

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
          Transaction History
        </Typography>
        <TextField
          variant="filled"
          size="small"
          placeholder="Search Task"
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
        <form onSubmit={handleSubmit}>
          <input type='file' 
            id='file' 
            name='file' 
            accept="image/png, image/jpeg, .pdf" 
            onChange={
              (event) => {setFileUpload(
                event.target.files? event.target.files[0] : null
              )}              
            }/>
          <button type='submit'>Enviar</button>
        </form> 
          
        <TransactionHistoryTable searchText={searchText} />
      </Box>
    </Paper>
  );
};

export default TransactionHistory;
