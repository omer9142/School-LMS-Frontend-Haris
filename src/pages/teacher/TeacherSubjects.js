import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Paper, Box, Typography, FormControl, InputLabel, Select, MenuItem, Container, useTheme, useMediaQuery } from "@mui/material";
import { getTeacherDetails } from "../../redux/teacherRelated/teacherHandle";
import TableViewTemplate from "../../components/TableViewTemplate";
import ScrollToTop from "../../components/ScrollToTop";

const TeacherSubjects = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { teacherDetails, loading } = useSelector((state) => state.teacher);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // State for selected class (default is "all" to show all subjects)
  const [selectedClassId, setSelectedClassId] = useState("all");

  // Fetch teacher details
  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getTeacherDetails(currentUser._id));
    }
  }, [dispatch, currentUser?._id]);

  // Normalize subjects
  const teacherSubjects = useMemo(() => {
    const raw = teacherDetails?.teachSubject;
    return raw ? (Array.isArray(raw) ? raw : [raw]) : [];
  }, [teacherDetails?.teachSubject]);

  // Extract unique classes from subjects
  const uniqueClasses = useMemo(() => {
    const classes = new Map(); // Using Map to avoid duplicates

    teacherSubjects.forEach((s) => {
      if (typeof s === "object" && s.sclassName) {
        const cls = s.sclassName;
        if (typeof cls === "object" && cls._id) {
          // Class is populated object
          if (!classes.has(cls._id)) {
            classes.set(cls._id, {
              id: cls._id,
              name: cls.sclassName || cls._id,
            });
          }
        } else if (typeof cls === "string") {
          // Class is ID string (not populated)
          if (!classes.has(cls)) {
            classes.set(cls, {
              id: cls,
              name: cls,
            });
          }
        }
      }
    });

    return Array.from(classes.values());
  }, [teacherSubjects]);

  // Set default selected class to "all" if classes exist
  useEffect(() => {
    if (uniqueClasses.length > 0 && selectedClassId === null) {
      setSelectedClassId("all");
    }
  }, [uniqueClasses, selectedClassId]);

  // Responsive column definitions
  const subjectColumns = useMemo(() => {
    const baseColumns = [
      { id: "subName", label: "Subject Name", minWidth: 150 },
      { id: "sessions", label: "Sessions", minWidth: 100, align: "center" },
      { id: "className", label: "Class", minWidth: 120 },
    ];

    // For mobile, reduce minWidth and possibly hide less important columns
    if (isMobile) {
      return baseColumns.map(col => ({
        ...col,
        minWidth: Math.min(col.minWidth, 100),
        label: col.id === "sessions" ? "Sess" : col.label, // Shorter label for mobile
      }));
    }

    return baseColumns;
  }, [isMobile]);

  // Filter subjects based on selected class
  const filteredSubjects = useMemo(() => {
    if (selectedClassId === "all") {
      return teacherSubjects;
    }

    return teacherSubjects.filter((s) => {
      if (typeof s !== "object" || !s.sclassName) return false;

      const cls = s.sclassName;
      if (typeof cls === "object" && cls._id) {
        return cls._id === selectedClassId;
      } else if (typeof cls === "string") {
        return cls === selectedClassId;
      }
      return false;
    });
  }, [teacherSubjects, selectedClassId]);

  const subjectRows = filteredSubjects
    .filter((s) => !!s) // remove falsy items
    .map((s) => {
      // s can be:
      // - a string / ObjectId (not populated)
      // - an object (populated subject)
      // - if backend returned nested arrays for some reason, handle gracefully

      // subject name & sessions
      const subName = typeof s === "string" ? "" : s.subName || "";
      const sessions = typeof s === "string" ? "" : s.sessions ?? "";

      // class field: Subject model uses `sclassName` to point to the class
      let className = "N/A";

      if (typeof s === "string") {
        // we only have an ID — can't show class name (backend must populate)
        className = "N/A";
      } else {
        const cls = s.sclassName;

        if (!cls) {
          className = "N/A";
        } else if (typeof cls === "string") {
          // class is an ID string
          className = cls;
        } else if (Array.isArray(cls)) {
          // defensive: if it came as array of objects (unlikely), join names
          className = cls.map(c => (c?.sclassName || c)).filter(Boolean).join(", ") || "N/A";
        } else {
          // populated object
          className = cls.sclassName || (cls._id ? String(cls._id) : "N/A");
        }
      }

      return {
        subName,
        sessions,
        className,
        id: (typeof s === "string" ? s : s._id) || Math.random().toString(36).slice(2),
      };
    });

  // Get selected class name for display
  const selectedClassName = useMemo(() => {
    if (selectedClassId === "all") {
      return "All Classes";
    }

    const selectedClass = uniqueClasses.find(c => c.id === selectedClassId);
    return selectedClass ? selectedClass.name : selectedClassId;
  }, [selectedClassId, uniqueClasses]);

  return (
    <>
      <ScrollToTop />
      <Container
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: 'lg',
          px: { xs: 2, sm: 3, md: 4 },
          mx: 'auto',
          mt: 2,
          mb: 4
        }}
      >
        {loading ? (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px'
          }}>
            <Typography variant="h6">Loading...</Typography>
          </Box>
        ) : (
          <>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              align="center" 
              gutterBottom 
              sx={{ 
                mb: 3,
                px: { xs: 1, sm: 0 },
                wordBreak: 'break-word'
              }}
            >
              Subjects {selectedClassName ? ` - ${selectedClassName}` : ""}
            </Typography>

            {/* Class selector dropdown */}
            {uniqueClasses.length > 0 && (
              <Box sx={{
                mb: 3,
                display: 'flex',
                justifyContent: 'center',
                px: { xs: 1, sm: 0 }
              }}>
                <FormControl 
                  size="small" 
                  sx={{ 
                    minWidth: isMobile ? 160 : 200,
                    width: isMobile ? '100%' : 'auto',
                    maxWidth: isMobile ? 300 : 'none'
                  }}
                >
                  <InputLabel id="teacher-class-select">Filter by Class</InputLabel>
                  <Select
                    labelId="teacher-class-select"
                    value={selectedClassId || "all"}
                    label="Filter by Class"
                    onChange={(e) => setSelectedClassId(e.target.value)}
                  >
                    <MenuItem value="all">All Classes</MenuItem>
                    {uniqueClasses.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
            {/* Subjects Table */}
            <Paper sx={{
              width: "100%",
              overflow: "auto", // Changed from "hidden" to "auto" for horizontal scrolling on very small screens
              mb: 3,
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backgroundColor: 'background.paper'
            }}>
              <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                mb: 2,
                gap: isMobile ? 1 : 0
              }}>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  sx={{ 
                    fontWeight: 500,
                    mb: isMobile ? 1 : 0
                  }}
                >
                  Subjects List:
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    fontWeight: 400
                  }}
                >
                  Total subjects: {subjectRows.length}
                </Typography>
              </Box>

              {subjectRows.length > 0 ? (
                <Box sx={{ 
                  width: '100%',
                  overflowX: 'auto',
                  '&::-webkit-scrollbar': {
                    height: 6,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'grey.100',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'grey.400',
                    borderRadius: 2,
                  },
                }}>
                  <TableViewTemplate 
                    columns={subjectColumns} 
                    rows={subjectRows} 
                    sx={{ 
                      minWidth: isMobile ? 400 : 'auto', // Minimum width for table on mobile
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "150px",
                  mt: 2,
                  p: 2,
                  textAlign: 'center'
                }}>
                  <Typography variant={isMobile ? "body1" : "h6"}>
                    {selectedClassId === "all"
                      ? "No Subjects Found"
                      : `No Subjects Found for ${selectedClassName}`}
                  </Typography>
                </Box>
              )}
            </Paper>
          </>
        )}
      </Container>
    </>
  );
};

export default TeacherSubjects;