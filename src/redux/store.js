import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './userRelated/userSlice';
import { studentReducer } from './studentRelated/studentSlice';
import { noticeReducer } from './noticeRelated/noticeSlice';
import { sclassReducer } from './sclassRelated/sclassSlice';
import { teacherReducer } from './teacherRelated/teacherSlice';
import { complainReducer } from './complainRelated/complainSlice';
import timetableReducer  from './timetableRelated/timetableSlice';
import marksReducer from './marksRelated/marksSlice';
import financeReducer from './financeRelated/financeSlice';
import feeReducer  from './feeRelated/feeSlice';
import { attendanceTrackerReducer } from './AttendanceTracker/attendanceTrackerSlice';
import { studentHealthReducer } from './studentHealthRelated/studentHealthSlice';
import { expensesReducer } from './expensesRelated/expensesSlice';
import { salariesReducer } from './salariesRelated/salariesSlice';
import { libraryReducer } from './libraryRelated/librarySlice';
import { profitReducer } from './ProfitRelated/profitSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        student: studentReducer,
        teacher: teacherReducer,
        notice: noticeReducer,
        complain: complainReducer,
        sclass: sclassReducer,
        timetable: timetableReducer,
        marks: marksReducer,
        finance: financeReducer,
        fee: feeReducer,
        attendanceTracker: attendanceTrackerReducer,
        studentHealth: studentHealthReducer,
        expenses: expensesReducer,
        salaries: salariesReducer,
        library: libraryReducer,
        profit: profitReducer,
    },
});

export default store;