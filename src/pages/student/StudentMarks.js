import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarksByStudent } from "../../redux/marksRelated/marksHandle";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Grid,
  Paper,
  LinearProgress,
  Alert,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Equalizer,
  School,
  CalendarToday,
  Search,
  FilterList,
} from "@mui/icons-material";
import ScrollToTop from "../../components/ScrollToTop";

const StudentMarksPage = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { marksList, loading, error } = useSelector((state) => state.marks);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const customTheme = {
    primary: "#1976d2",
    secondary: "#000000",
    accent: "#1a1a1a",
    background: "#f5f5f5",
    surface: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#666666",
    border: "#e0e0e0",
    success: "#2e7d32",
    warning: "#ed6c02",
    error: "#d32f2f",
    gray: "#757575",
  };

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchMarksByStudent(currentUser._id));
    }
  }, [currentUser, dispatch]);

  // Get unique subjects and assessment types for filters
  const subjects = [...new Set(marksList.map(mark => mark.subjectId?.subName).filter(Boolean))];
  const assessmentTypes = [...new Set(marksList.map(mark => mark.assessmentType).filter(Boolean))];

  // Filter and sort marks
  const filteredMarks = marksList
    .filter(mark => {
      const matchesSearch = 
        mark.subjectId?.subName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mark.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mark.assessmentType?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSubject = filterSubject === "all" || mark.subjectId?.subName === filterSubject;
      const matchesType = filterType === "all" || mark.assessmentType === filterType;
      
      return matchesSearch && matchesSubject && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date) - new Date(a.date);
        case "percentage":
          return (b.obtainedMarks / b.totalMarks) - (a.obtainedMarks / a.totalMarks);
        case "subject":
          return (a.subjectId?.subName || "").localeCompare(b.subjectId?.subName || "");
        case "type":
          return a.assessmentType.localeCompare(b.assessmentType);
        default:
          return 0;
      }
    });

  const getPercentage = (mark) => {
    if (!mark.obtainedMarks || !mark.totalMarks || mark.totalMarks === 0) return 0;
    const percentage = (mark.obtainedMarks / mark.totalMarks) * 100;
    return isNaN(percentage) ? 0 : percentage;
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: "A+", color: customTheme.success };
    if (percentage >= 80) return { grade: "A", color: customTheme.success };
    if (percentage >= 70) return { grade: "B", color: "#388e3c" };
    if (percentage >= 60) return { grade: "C", color: customTheme.gray };
    if (percentage >= 50) return { grade: "D", color: customTheme.warning };
    return { grade: "F", color: customTheme.error };
  };

  // Calculate overall statistics
  const totalMarks = filteredMarks.length;
  const averagePercentage = totalMarks > 0 
    ? filteredMarks.reduce((sum, mark) => sum + getPercentage(mark), 0) / totalMarks 
    : 0;
  
  const bestSubject = totalMarks > 0 
    ? filteredMarks.reduce((best, mark) => 
        getPercentage(mark) > getPercentage(best) ? mark : best
      ) 
    : null;
  
  const needsImprovement = totalMarks > 0 
    ? filteredMarks.reduce((worst, mark) => 
        getPercentage(mark) < getPercentage(worst) ? mark : worst
      ) 
    : null;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} thickness={4} sx={{ color: customTheme.primary }} />
          <Typography variant="h6" sx={{ mt: 2, color: customTheme.text }}>
            Loading your marks...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Box sx={{ 
        background: customTheme.background, 
        minHeight: "100vh", 
        py: 4,
        marginLeft: { xs: 0, md: '0px' },
        width: { xs: '100%', md: 'calc(100% - 0px)' },
        transition: 'margin-left 0.3s ease, width 0.3s ease'
      }}>
        <Container maxWidth={isMobile ? false : "xl"} sx={{ 
          width: "100%",
          px: { xs: 2, sm: 3, md: 4 }
        }}>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              sx={{
                color: customTheme.accent,
                fontWeight: "bold",
                textAlign: "center",
                mb: 2,
              }}
            >
              My Academic Performance
            </Typography>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              sx={{
                color: customTheme.textSecondary,
                textAlign: "center",
                mb: 4,
              }}
            >
              Track your progress and performance across all subjects
            </Typography>
          </Box>

          {/* Statistics Cards */}
          {marksList.length > 0 && (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: customTheme.accent,
                  color: "white",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  height: '100%',
                  border: `1px solid ${customTheme.border}`
                }}>
                  <CardContent sx={{ textAlign: "center", p: 2 }}>
                    <Equalizer sx={{ fontSize: isMobile ? 30 : 40, mb: 1 }} />
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
                      {totalMarks}
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body1"}>
                      Total Assessments
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: customTheme.primary,
                  color: "white",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  height: '100%',
                  border: `1px solid ${customTheme.border}`
                }}>
                  <CardContent sx={{ textAlign: "center", p: 2 }}>
                    <TrendingUp sx={{ fontSize: isMobile ? 30 : 40, mb: 1 }} />
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
                      {averagePercentage.toFixed(1)}%
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body1"}>
                      Average Score
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: customTheme.success,
                  color: "white",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  height: '100%',
                  border: `1px solid ${customTheme.border}`
                }}>
                  <CardContent sx={{ textAlign: "center", p: 2 }}>
                    <School sx={{ fontSize: isMobile ? 30 : 40, mb: 1 }} />
                    <Typography variant={isMobile ? "body2" : "h6"} fontWeight="bold" noWrap>
                      {bestSubject?.subjectId?.subName || "N/A"}
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      Best Subject
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: customTheme.gray,
                  color: "white",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  height: '100%',
                  border: `1px solid ${customTheme.border}`
                }}>
                  <CardContent sx={{ textAlign: "center", p: 2 }}>
                    <CalendarToday sx={{ fontSize: isMobile ? 30 : 40, mb: 1 }} />
                    <Typography variant={isMobile ? "body2" : "h6"} fontWeight="bold">
                      {new Date().getFullYear()}
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      Academic Year
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Filters and Search */}
          {marksList.length > 0 && (
            <Card sx={{ 
              mb: 3, 
              borderRadius: 2, 
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              border: `1px solid ${customTheme.border}`
            }}>
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search by subject, topic, or type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      select
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      label="Subject"
                    >
                      <MenuItem value="all">All Subjects</MenuItem>
                      {subjects.map((subject) => (
                        <MenuItem key={subject} value={subject}>
                          {subject}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      label="Assessment Type"
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      {["Test", "Quiz", "Mid Term", "Final", "Other"].map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Sort By"
                    >
                      <MenuItem value="date">Date (Newest)</MenuItem>
                      <MenuItem value="percentage">Percentage</MenuItem>
                      <MenuItem value="subject">Subject</MenuItem>
                      <MenuItem value="type">Type</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FilterList />}
                      onClick={() => {
                        setSearchTerm("");
                        setFilterSubject("all");
                        setFilterType("all");
                        setSortBy("date");
                      }}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        borderColor: customTheme.gray,
                        color: customTheme.gray,
                        '&:hover': {
                          borderColor: customTheme.accent,
                          backgroundColor: 'rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      {isMobile ? "Clear" : "Clear Filters"}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          {marksList.length === 0 ? (
            <Card sx={{ 
              textAlign: "center", 
              py: 8, 
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              background: customTheme.surface,
              border: `1px solid ${customTheme.border}`
            }}>
              <CardContent>
                <School sx={{ fontSize: isMobile ? 60 : 80, color: customTheme.gray, mb: 2 }} />
                <Typography variant={isMobile ? "h6" : "h5"} color={customTheme.text} gutterBottom>
                  No Marks Available Yet
                </Typography>
                <Typography variant="body1" color={customTheme.textSecondary}>
                  Your marks will appear here once your teachers start adding them.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Marks Table */}
              <Card sx={{ 
                borderRadius: 2, 
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                overflow: "auto",
                maxWidth: '100%',
                border: `1px solid ${customTheme.border}`
              }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: isMobile ? 800 : '100%' }}>
                      <TableHead>
                        <TableRow sx={{ 
                          background: customTheme.accent
                        }}>
                          <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: isMobile ? "0.875rem" : "1rem", whiteSpace: 'nowrap' }}>
                            Subject
                          </TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: isMobile ? "0.875rem" : "1rem", whiteSpace: 'nowrap' }}>
                            Assessment
                          </TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: isMobile ? "0.875rem" : "1rem", whiteSpace: 'nowrap' }}>
                            Topic
                          </TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: isMobile ? "0.875rem" : "1rem", whiteSpace: 'nowrap' }}>
                            Date
                          </TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: isMobile ? "0.875rem" : "1rem", whiteSpace: 'nowrap' }}>
                            Marks
                          </TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: isMobile ? "0.875rem" : "1rem", whiteSpace: 'nowrap' }}>
                            Percentage
                          </TableCell>
                         
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredMarks.map((mark) => {
                          const percentage = getPercentage(mark);
                          const gradeInfo = getGrade(percentage);
                          const percentageColor = percentage >= 50 ? customTheme.success : customTheme.error;

                          return (
                            <TableRow 
                              key={mark._id} 
                              sx={{ 
                                "&:hover": { 
                                  backgroundColor: "#fafafa",
                                  transition: "all 0.2s ease"
                                },
                                transition: "all 0.2s ease"
                              }}
                            >
                              <TableCell sx={{ color: customTheme.text, fontWeight: "500", whiteSpace: 'nowrap' }}>
                                {mark.subjectId?.subName || "N/A"}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={mark.assessmentType} 
                                  size="small"
                                  sx={{
                                    backgroundColor: customTheme.primary,
                                    color: 'white',
                                    fontWeight: 500
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ color: customTheme.text, whiteSpace: 'nowrap' }}>
                                {mark.topic || "General"}
                              </TableCell>
                              <TableCell sx={{ color: customTheme.textSecondary, whiteSpace: 'nowrap' }}>
                                {mark.date ? new Date(mark.date).toLocaleDateString() : "N/A"}
                              </TableCell>
                              <TableCell sx={{ color: customTheme.text, fontWeight: "bold", whiteSpace: 'nowrap' }}>
                                {mark.obtainedMarks} / {mark.totalMarks}
                              </TableCell>
                              <TableCell sx={{ color: percentageColor, fontWeight: "bold", whiteSpace: 'nowrap' }}>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                  {percentage.toFixed(1)}%
                                  {percentage >= 70 ? 
                                    <TrendingUp sx={{ fontSize: 16, ml: 0.5, color: customTheme.success }} /> :
                                    percentage >= 50 ? 
                                    <Equalizer sx={{ fontSize: 16, ml: 0.5, color: customTheme.gray }} /> :
                                    <TrendingDown sx={{ fontSize: 16, ml: 0.5, color: customTheme.error }} />
                                  }
                                </Box>
                              </TableCell>
                            
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>

                  {filteredMarks.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body1" color={customTheme.textSecondary}>
                        No marks found matching your filters.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </Container>
      </Box>
    </>
  );
};

export default StudentMarksPage;