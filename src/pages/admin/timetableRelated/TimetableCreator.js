import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getAllSclasses } from "../../../redux/sclassRelated/sclassHandle";
import { saveTimetable } from "../../../redux/timetableRelated/timetableHandle";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = [
  "Period 1",
  "Period 2",
  "Period 3",
  "Period 4",
  "Period 5",
  "Period 6",
  "Period 7",
  "Period 8",
];

const TimetableCreator = () => {
  const dispatch = useDispatch();
  const { sclassesList, loading: classesLoading } = useSelector(
    (state) => state.sclass
  );
  const { currentUser } = useSelector((state) => state.user);

  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [grid, setGrid] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [breakAfterPeriod, setBreakAfterPeriod] = useState(4); // Default: break after 4th period

  // ✅ Fetch all classes using Redux (like TimetableManager)
  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getAllSclasses(currentUser._id, "sclass"));
    }
  }, [dispatch, currentUser]);

  // ✅ Fetch subjects when class selected
  useEffect(() => {
    if (!selectedClass) return;

    const fetchSubjects = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/ClassSubjects/${selectedClass}`
        );
        setSubjects(res.data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };

    fetchSubjects();

    // Fetch existing timetable if available
    const fetchExistingTimetable = async () => {
      setLoadingTimetable(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/timetable/class/${selectedClass}`
        );
        
        if (res.data && res.data.length > 0) {
          // Load existing timetable into grid
          const existingGrid = {};
          days.forEach((day) => {
            existingGrid[day] = {};
            periods.forEach((_, idx) => {
              existingGrid[day][idx + 1] = "";
            });
          });

          res.data.forEach((entry) => {
            if (existingGrid[entry.day]) {
              existingGrid[entry.day][entry.periodNumber] = entry.subject;
            }
          });

          setGrid(existingGrid);

          // Set break position from existing data
          if (res.data[0].breakAfterPeriod !== undefined) {
            setBreakAfterPeriod(res.data[0].breakAfterPeriod);
          }
        } else {
          // Initialize empty grid
          const emptyGrid = {};
          days.forEach((day) => {
            emptyGrid[day] = {};
            periods.forEach((_, idx) => {
              emptyGrid[day][idx + 1] = "";
            });
          });
          setGrid(emptyGrid);
        }
      } catch (err) {
        console.error("Error fetching existing timetable:", err);
        // Initialize empty grid on error
        const emptyGrid = {};
        days.forEach((day) => {
          emptyGrid[day] = {};
          periods.forEach((_, idx) => {
            emptyGrid[day][idx + 1] = "";
          });
        });
        setGrid(emptyGrid);
      }
      setLoadingTimetable(false);
    };

    fetchExistingTimetable();
  }, [selectedClass]);

  // Handle dropdown change in cell
  const handleCellChange = (day, periodNumber, subjectId) => {
    setGrid((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [periodNumber]: subjectId,
      },
    }));
  };

  // ✅ Save timetable through Redux handle
  const handleSave = async () => {
    if (!selectedClass) {
      alert("Select a class first");
      return;
    }

    // Convert grid into array of entries
    const timetableEntries = [];
    days.forEach((day) => {
      periods.forEach((_, idx) => {
        const subjectId = grid[day][idx + 1];
        if (subjectId) {
          timetableEntries.push({
            adminID: currentUser._id,
            classId: selectedClass,
            day,
            periodNumber: idx + 1,
            subject: subjectId,
          });
        }
      });
    });
    console.log("timetableEntries sending:", timetableEntries);

    try {
      setLoading(true);
      await dispatch(
        saveTimetable({
          entries: timetableEntries,
          adminID: currentUser._id,
          breakAfterPeriod: breakAfterPeriod, // Include break position
        })
      );
      alert("Timetable saved successfully!");
    } catch (err) {
      console.error("Error saving timetable:", err);
      alert("Error saving timetable");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render table headers with break column
  const renderTableHeaders = () => {
    const headers = [];
    headers.push(
      <TableCell key="day" sx={{ fontWeight: "bold" }}>
        Day
      </TableCell>
    );

    periods.forEach((period, index) => {
      headers.push(
        <TableCell key={index} align="center" sx={{ fontWeight: "bold" }}>
          {period}
        </TableCell>
      );

      // Add break column after the selected period
      if (index + 1 === breakAfterPeriod) {
        headers.push(
          <TableCell
            key="break"
            align="center"
            sx={{
              fontWeight: "bold",
              backgroundColor: "#f5f5f5",
              color: "#1976d2",
            }}
          >
            BREAK
          </TableCell>
        );
      }
    });

    return headers;
  };

  // Helper function to render table cells with break column
  const renderTableCells = (day) => {
    const cells = [];

    periods.forEach((_, colIndex) => {
      cells.push(
        <TableCell key={colIndex} align="center">
          <FormControl fullWidth>
            <Select
              value={grid[day]?.[colIndex + 1] || ""}
              onChange={(e) =>
                handleCellChange(day, colIndex + 1, e.target.value)
              }
              displayEmpty
            >
              <MenuItem value="">--</MenuItem>
              {subjects.map((sub) => (
                <MenuItem key={sub._id} value={sub._id}>
                  {sub.subName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>
      );

      // Add break cell after the selected period
      if (colIndex + 1 === breakAfterPeriod) {
        cells.push(
          <TableCell
            key="break"
            align="center"
            sx={{
              backgroundColor: "#f5f5f5",
              fontStyle: "italic",
              color: "#666",
            }}
          >
            Break
          </TableCell>
        );
      }
    });

    return cells;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create Class Timetable
      </Typography>

      {/* Class Selector */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Class</InputLabel>
        <Select
          value={selectedClass}
          label="Select Class"
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          {sclassesList &&
            sclassesList.map((cls) => (
              <MenuItem key={cls._id} value={cls._id}>
                {cls.sclassName}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* Break Position Selector */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Break After Period</InputLabel>
        <Select
          value={breakAfterPeriod}
          label="Break After Period"
          onChange={(e) => setBreakAfterPeriod(e.target.value)}
        >
          {periods.map((period, index) => (
            <MenuItem key={index} value={index + 1}>
              After {period}
            </MenuItem>
          ))}
          <MenuItem value={0}>No Break</MenuItem>
        </Select>
      </FormControl>

      {classesLoading || loading || loadingTimetable ? (
        <CircularProgress />
      ) : (
        selectedClass && (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>{renderTableHeaders()}</TableRow>
                </TableHead>

                <TableBody>
                  {days.map((day, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell sx={{ fontWeight: "bold" }}>{day}</TableCell>
                      {renderTableCells(day)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save Timetable
              </Button>
            </Box>
          </>
        )
      )}
    </Box>
  );
};

export default TimetableCreator;