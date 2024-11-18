import Stack from '@mui/material/Stack';
import { DataGrid, GridColDef, GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';
import { Typography } from '@mui/material';
import ActionMenu from './ActionMenu';

interface Transaction {
  id: number;
  nomePagador: string;
  nomeBanco: string;
  data: string;
  hora: string;
  valor: number;
}



interface TransactionHistoryTableProps {
  searchText: string;
  transactions: Transaction[];
  onDelete: () => void;
  onSelectionChange: (ids: GridRowId[]) => void;
}

const TransactionHistoryTable = ({ 
  searchText,
  transactions, 
  onDelete, 
  onSelectionChange 
}: TransactionHistoryTableProps) => {
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Id',
      editable: false,
      align: 'left',
      flex: 2,
      minWidth: 30,
      maxWidth: 90,
      renderHeader: () => (
        <Typography variant="body2" fontWeight={600} ml={1}>
          Id
        </Typography>
      ),
      renderCell: (params) => (
        <Stack ml={1} height={1} direction="column" alignSelf="center" justifyContent="center">
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'nomeBanco',
      headerName: 'Banco',
      editable: false,
      align: 'left',
      flex: 2,
      minWidth: 100,
    },
    {
      field: 'nomePagador',
      headerName: 'Pagador',
      editable: false,
      align: 'left',
      flex: 2,
      minWidth: 150,
    },
    {
      field: 'valor',
      headerName: 'Valor',
      editable: false,
      align: 'left',
      flex: 2,
      minWidth: 130,
    },
    {
      field: 'data',
      headerName: 'Data',
      editable: false,
      align: 'left',
      flex: 2,
      minWidth: 120,
    },
    {
      field: 'hora',
      headerName: 'Hora',
      editable: false,
      align: 'left',
      flex: 2,
      minWidth: 120,
    },
    {
      field: 'action',
      headerAlign: 'right',
      align: 'right',
      editable: false,
      sortable: false,
      flex: 1,
      minWidth: 100,
      renderHeader: () => <ActionMenu onRemove={onDelete} />,
      renderCell: () => <ActionMenu onRemove={onDelete} />,
    },
  ];
  
  const handleSelectionChange = (rowSelectionModel: GridRowSelectionModel) => {
    // Convertendo rowSelectionModel para GridRowId[] e passando para onSelectionChange
    onSelectionChange(Array.from(rowSelectionModel));
  };

  return (
    <DataGrid
      columns={columns}
      rows={transactions}
      filterModel={{
        items: [
          {
            field: "nomePagador",
            operator: 'contains',
            value: searchText,
          },
        ],
      }}
      onRowSelectionModelChange={handleSelectionChange}/* {ids: GridRowId[] => onSelectionChange(ids)} */
      rowHeight={52}
      disableColumnResize
      disableColumnMenu
      disableColumnSelector
      disableRowSelectionOnClick
      initialState={{
        pagination: { paginationModel: { pageSize: 5 } },
      }}
      checkboxSelection
      pageSizeOptions={[5]}
    />
  );  
};

export default TransactionHistoryTable;