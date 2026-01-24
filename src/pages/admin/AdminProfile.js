import React from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, Typography, Avatar, Divider, Box } from "@mui/material";
import { deepPurple } from "@mui/material/colors";

const AdminProfile = () => {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mt: 5,
      }}
    >
      <Card
        sx={{
          width: 400,
          borderRadius: 4,
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          textAlign: "center",
          p: 3,
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            bgcolor: deepPurple[500],
            width: 80,
            height: 80,
            fontSize: "2rem",
            mx: "auto",
            mb: 2,
          }}
        >
          {currentUser?.name?.charAt(0).toUpperCase()}
        </Avatar>

        {/* Profile Info */}
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {currentUser?.name}
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Email:</strong> {currentUser?.email}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>School:</strong> {currentUser?.schoolName}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminProfile;
