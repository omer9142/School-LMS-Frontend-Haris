export const calculateSubjectAttendancePercentage = (presentCount, totalSessions) => {
    if (totalSessions === 0 || presentCount === 0) {
        return 0;
    }
    const percentage = (presentCount / totalSessions) * 100;
    return percentage.toFixed(2); // Limit to two decimal places
};


export const groupAttendanceBySubject = (subjectAttendance) => {
    const attendanceBySubject = {};

    subjectAttendance.forEach((attendance) => {
        const subName = attendance.subName.subName;
        const sessions = attendance.subName.sessions;
        const subId = attendance.subName._id;

        if (!attendanceBySubject[subName]) {
            attendanceBySubject[subName] = {
                present: 0,
                absent: 0,
                sessions: sessions,
                allData: [],
                subId: subId
            };
        }
        if (attendance.status === "Present") {
            attendanceBySubject[subName].present++;
        } else if (attendance.status === "Absent") {
            attendanceBySubject[subName].absent++;
        }
        attendanceBySubject[subName].allData.push({
            date: attendance.date,
            status: attendance.status,
        });
    });
    return attendanceBySubject;
}

// attendanceCalculator.js
export const calculateOverallAttendancePercentage = (attendance) => {
    if (!attendance || !Array.isArray(attendance)) return 0;
    
    // Filter only valid attendance records with date and status
    const validAttendance = attendance.filter(record => 
        record.date && (record.status === 'Present' || record.status === 'Absent')
    );
    
    const presentCount = validAttendance.filter(record => 
        record.status === 'Present'
    ).length;
    
    const totalSessions = validAttendance.length;
    
    // Calculate percentage and round to 2 decimal places
    return totalSessions > 0 ? parseFloat(((presentCount / totalSessions) * 100).toFixed(2)) : 0;
};