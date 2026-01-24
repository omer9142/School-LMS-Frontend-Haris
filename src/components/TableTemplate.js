import React, { useState } from 'react';
import { StyledTableCell, StyledTableRow } from './styles';
import { Table, TableBody, TableContainer, TableHead, Box, Button, IconButton } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const TableTemplate = ({ buttonHaver: ButtonHaver, columns, rows }) => {
    const [page, setPage] = useState(1);
    const rowsPerPage = 15;

    // 🧠 Only show Actions column if ButtonHaver is a valid function and not Empty
    const showActions =
        typeof ButtonHaver === 'function' &&
        ButtonHaver.toString().replace(/\s/g, '') !== '()=>null' &&
        ButtonHaver.toString().replace(/\s/g, '') !== '()=>{}';

    // Calculate paginated rows
    const pageCount = Math.ceil(rows.length / rowsPerPage);
    
    // ✅ Only show pagination if there are more than 15 rows
    const shouldShowPagination = rows.length > 15;
    
    const paginatedRows = shouldShowPagination 
        ? rows.slice((page - 1) * rowsPerPage, page * rowsPerPage)
        : rows; // Show all rows if pagination is hidden

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

    return (
        <>
            <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <StyledTableRow>
                            {columns.map((column) => (
                                <StyledTableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </StyledTableCell>
                            ))}
                            {showActions && (
                                <StyledTableCell 
                                    align="right"
                                    style={{ 
                                        minWidth: '300px',
                                        paddingRight: '60px',
                                        textAlign: 'right'
                                    }}
                                >
                                    Actions
                                </StyledTableCell>
                            )}
                        </StyledTableRow>
                    </TableHead>

                    <TableBody>
                        {paginatedRows.map((row) => (
                            <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                {columns.map((column) => {
                                    const value = row[column.id];
                                    return (
                                        <StyledTableCell key={column.id} align={column.align}>
                                            {column.format && typeof value === 'number'
                                                ? column.format(value)
                                                : value}
                                        </StyledTableCell>
                                    );
                                })}
                                {showActions && (
                                    <StyledTableCell 
                                        align="right"
                                        style={{ 
                                            textAlign: 'right',
                                            paddingRight: '40px'
                                        }}
                                    >
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'flex-end',
                                            alignItems: 'center',
                                            width: '100%',
                                            gap: '1rem'
                                        }}>
                                            <ButtonHaver row={row} />
                                        </div>
                                    </StyledTableCell>
                                )}
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Page Navigation - Only visible when rows > 15 */}
            {shouldShowPagination && (
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
                            border: '1px solid #757575',
                            borderRadius: 1,
                            color: '#ffffff',
                            backgroundColor: '#757575',
                            '&:hover:not(:disabled)': {
                                backgroundColor: '#616161',
                                borderColor: '#616161',
                            },
                            '&:disabled': {
                                color: '#ffffff',
                                backgroundColor: '#424242',
                                borderColor: '#424242',
                                opacity: 1,
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
                                    borderColor: '#9e9e9e',
                                    fontWeight: 700,
                                    fontSize: '16px',
                                    '&:hover': {
                                        backgroundColor: page === pageNum ? '#1565c0' : '#f5f5f5',
                                        borderColor: page === pageNum ? '#1976d2' : '#757575',
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
                            border: '1px solid #757575',
                            borderRadius: 1,
                            color: '#ffffff',
                            backgroundColor: '#757575',
                            '&:hover:not(:disabled)': {
                                backgroundColor: '#616161',
                                borderColor: '#616161',
                            },
                            '&:disabled': {
                                color: '#ffffff',
                                backgroundColor: '#424242',
                                borderColor: '#424242',
                                opacity: 1,
                                cursor: 'not-allowed'
                            }
                        }}
                    >
                        <NavigateNextIcon />
                    </IconButton>
                </Box>
            )}
        </>
    );
};

export default TableTemplate;