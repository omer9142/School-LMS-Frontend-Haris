import { useEffect, useState } from 'react';
import { 
  IconButton, 
  Box, 
  Button, 
  Table, 
  TableBody, 
  TableContainer, 
  TableHead,
  TextField,
  Typography,
  Chip,
  useMediaQuery
} from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {deleteClass} from '../../../redux/sclassRelated/sclassHandle'
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import styled from 'styled-components';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import AddCardIcon from '@mui/icons-material/AddCard';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const ShowClasses = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { sclassesList, loading, error, getresponse } = useSelector((state) => state.sclass);
  const { currentUser } = useSelector(state => state.user)

  const adminID = currentUser._id

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 15;

  useEffect(() => {
    dispatch(getAllSclasses(adminID, "Sclass"));
  }, [adminID, dispatch]);

  if (error) {
    console.log(error)
  }

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const deleteHandler = (deleteID, address) => {
     if (window.confirm("Are you sure you want to delete this Class?")) {
         dispatch(deleteClass(deleteID, address))
             .then(() => {
                 dispatch(getAllSclasses(adminID, "Sclass")); 
             })
             .catch((err) => {
                 console.error(err);
                 setMessage("Failed to delete Class.");
                 setShowPopup(true);
             });
     }
 };

  // Filter classes based on search term only
  const filteredClasses = Array.isArray(sclassesList)
    ? sclassesList.filter(sclass => {
        // Search filter
        const matchesSearch = 
          sclass.sclassName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
      })
    : [];

  // Sort classes in chronological order (by creation date)
  const sortedClasses = [...filteredClasses].sort((a, b) => {
    // Sort by creation date (oldest first)
    if (a.createdAt && b.createdAt) {
        return new Date(a.createdAt) - new Date(b.createdAt);
    }
    // If classes have _id, they roughly indicate creation order in MongoDB
    if (a._id && b._id) {
        return a._id.localeCompare(b._id);
    }
    return 0;
  });

  const sclassColumns = [
    { id: 'name', label: 'Class Name', minWidth: isMobile ? 100 : 170 },
  ]

  // Use filtered and sorted classes
  const sclassRows = Array.isArray(sortedClasses) && sortedClasses.length > 0 
    ? sortedClasses.map((sclass) => {
        return {
          name: sclass.sclassName,
          id: sclass._id,
        };
      })
    : []; // Return empty array if sclassesList is not an array or is empty

  // Pagination calculations based on filtered rows
  const pageCount = Math.ceil(sclassRows.length / rowsPerPage);
  const paginatedRows = sclassRows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < pageCount) {
      setPage(page + 1);
    }
  };

  const handlePageClick = (pageNum) => {
    setPage(pageNum);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (pageCount <= maxPagesToShow) {
      // Show all pages if total pages are less than max
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (page <= 3) {
        // Show first 3 pages, then ellipsis, then last page
        pages.push(1, 2, 3, 4, '...', pageCount);
      } else if (page >= pageCount - 2) {
        // Show first page, ellipsis, then last 4 pages
        pages.push(1, '...', pageCount - 3, pageCount - 2, pageCount - 1, pageCount);
      } else {
        // Show first, ellipsis, current-1, current, current+1, ellipsis, last
        pages.push(1, '...', page - 1, page, page + 1, '...', pageCount);
      }
    }
    
    return pages;
  };

  // Clear search filter
  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(1);
  };

  const actions = [
    {
      icon: <AddCardIcon color="primary" />, name: 'Add New Class',
      action: () => navigate("/Admin/addclass")
    },
    {
      icon: <DeleteIcon color="error" />, name: 'Delete All Classes',
      action: () => deleteHandler(adminID, "Sclasses")
    },
  ];

  return (
    <>
      {loading ?
        <div>Loading...</div>
        :
        <>
          {getresponse ?
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <GreenButton variant="contained" onClick={() => navigate("/Admin/addclass")}>
                Add Class
              </GreenButton>
            </Box>
            :
            <Box sx={{ width: '100%', p: 2 }}>
              {/* Search Bar with Clear Button */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search by class name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1); // Reset to first page when search changes
                  }}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                    endAdornment: searchTerm && (
                      <IconButton
                        onClick={handleClearSearch}
                        edge="end"
                        size="small"
                        sx={{ mr: 0.5 }}
                      >
                        <ClearIcon />
                      </IconButton>
                    )
                  }}
                  sx={{ mb: 2 }}
                />
                
                {/* Summary */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {sortedClasses.length} class(es) found
                    {searchTerm && ` for "${searchTerm}"`}
                  </Typography>
                  
                  {searchTerm && (
                    <Chip
                      label="Clear Search"
                      onClick={handleClearSearch}
                      color="default"
                      variant="outlined"
                      size="small"
                      sx={{ cursor: 'pointer' }}
                    />
                  )}
                </Box>
                
                {/* Current Filters */}
                {searchTerm && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      label={`Search: "${searchTerm}"`}
                      onDelete={handleClearSearch}
                      size="small"
                    />
                  </Box>
                )}
              </Box>

              {sclassRows.length > 0 ? (
                <>
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table stickyHeader aria-label="sticky table" sx={{ minWidth: { xs: 'auto', sm: 650 } }}>
                      <TableHead>
                        <StyledTableRow>
                          {sclassColumns.map((column) => (
                            <StyledTableCell
                              key={column.id}
                              align={column.align}
                              sx={{ 
                                minWidth: column.minWidth,
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                padding: { xs: '12px 8px', sm: '16px' }
                              }}
                            >
                              {column.label}
                            </StyledTableCell>
                          ))}
                          <StyledTableCell 
                            align="right"
                            sx={{ 
                              minWidth: { xs: 140, sm: 300 },
                              paddingRight: { xs: '8px', sm: '60px' },
                              textAlign: 'right',
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              padding: { xs: '12px 8px', sm: '16px' }
                            }}
                          >
                            Actions
                          </StyledTableCell>
                        </StyledTableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedRows.map((row) => (
                          <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                            {sclassColumns.map((column) => {
                              const value = row[column.id];
                              return (
                                <StyledTableCell 
                                  key={column.id} 
                                  align={column.align}
                                  sx={{
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    padding: { xs: '12px 8px', sm: '16px' }
                                  }}
                                >
                                  {column.format && typeof value === 'number'
                                    ? column.format(value)
                                    : value}
                                </StyledTableCell>
                              );
                            })}
                            <StyledTableCell 
                              align="right"
                              sx={{ 
                                textAlign: 'right',
                                paddingRight: { xs: '8px', sm: '40px' },
                                padding: { xs: '12px 8px', sm: '16px' }
                              }}
                            >
                              <ButtonContainer isMobile={isMobile}>
                                <IconButton 
                                  onClick={() => deleteHandler(row.id, "Sclass")} 
                                  color="secondary"
                                  size={isMobile ? "small" : "medium"}
                                >
                                  <DeleteIcon color="error" fontSize={isMobile ? "small" : "medium"} />
                                </IconButton>
                                <BlueButton 
                                  variant="contained"
                                  onClick={() => navigate("/Admin/classes/class/" + row.id)}
                                  sx={{
                                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                    padding: { xs: '4px 8px', sm: '6px 16px' },
                                    minWidth: { xs: '50px', sm: 'auto' }
                                  }}
                                >
                                  View
                                </BlueButton>
                              </ButtonContainer>
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Page Navigation */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    mt: 3,
                    mb: 2,
                    gap: 1
                  }}>
                    {/* Previous Button */}
                   <IconButton
    onClick={handlePrevious}
    disabled={page === 1}
    sx={{ 
      border: '1px solid #7575755e',
        borderRadius: 1,
        color: '#777575ff',
        backgroundColor: '#ffffffff',
        '&:hover:not(:disabled)': {
            backgroundColor: '#a09e9edcff',
            borderColor: '#61616157',
        },
        '&:disabled': {
            backgroundColor: '#ffffffff',
            borderColor: '#42424234',
            color: '#606060ff',
            opacity: 0.7,
            cursor: 'not-allowed'
        }
    }}
>
    <NavigateBeforeIcon />
</IconButton>

                    {/* Page Numbers */}
                    {getPageNumbers().map((pageNum, index) => (
                      pageNum === '...' ? (
                        <Box 
                          key={`ellipsis-${index}`}
                          sx={{ 
                            px: 2,
                            py: 1,
                            color: '#000',
                            fontWeight: 600,
                            fontSize: '16px'
                          }}
                        >
                          ...
                        </Box>
                      ) : (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageClick(pageNum)}
                          variant={page === pageNum ? 'contained' : 'outlined'}
                          sx={{ 
                            minWidth: '45px',
                            height: '45px',
                            color: page === pageNum ? '#fff' : '#000',
                            backgroundColor: page === pageNum ? '#1976d2' : 'transparent',
                            borderColor: '#ddd',
                            fontWeight: 700,
                            fontSize: '16px',
                            '&:hover': {
                              backgroundColor: page === pageNum ? '#1565c0' : '#f5f5f5',
                              borderColor: page === pageNum ? '#1976d2' : '#999',
                            }
                          }}
                        >
                          {pageNum}
                        </Button>
                      )
                    ))}

                    {/* Next Button */}
                   <IconButton
    onClick={handleNext}
    disabled={page >= pageCount}
    sx={{ 
        border: '1px solid #7575755e',
        borderRadius: 1,
        color: '#777575ff',
        backgroundColor: '#ffffffff',
        '&:hover:not(:disabled)': {
            backgroundColor: '#a09e9edcff',
            borderColor: '#61616157',
        },
        '&:disabled': {
           backgroundColor: '#ffffffff',
            borderColor: '#42424234',
            color: '#606060ff',
            opacity: 0.7,
            cursor: 'not-allowed'
        }
    }}
>
    <NavigateNextIcon />
</IconButton>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    {searchTerm 
                      ? 'No classes found matching your search.' 
                      : 'No classes found.'}
                  </Typography>
                  {searchTerm && (
                    <GreenButton 
                      variant="contained" 
                      onClick={handleClearSearch}
                      sx={{ mt: 2 }}
                    >
                      Clear Search
                    </GreenButton>
                  )}
                </Box>
              )}
              <SpeedDialTemplate actions={actions} />
            </Box>}
        </>
      }
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default ShowClasses;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.isMobile ? 'flex-end' : 'center'};
  gap: ${props => props.isMobile ? '0.3rem' : '1rem'};
  width: 100%;
`;