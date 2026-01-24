import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Grid, Box, Button, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import styled from 'styled-components';
import Students from "../assets/students.svg";
import { LightPurpleButton } from '../components/buttonStyles';

const Homepage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <StyledContainer>
            <Grid container spacing={0}>
                <Grid item xs={12} md={6}>
                    <ImageContainer>
                        <img src={Students} alt="students" />
                    </ImageContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                    <StyledPaper elevation={3}>
                        <ContentWrapper>
                            <StyledTitle>
                                {isMobile ? (
                                    "Welcome to School Management System"
                                ) : (
                                    <>
                                        Welcome to
                                        <br />
                                        School Management
                                        <br />
                                        System
                                    </>
                                )}
                            </StyledTitle>
                            <StyledText>
                                Streamline school management, class organization, and add students and faculty.
                                Seamlessly track attendance, assess performance, and provide feedback.
                                Access records, view marks, and communicate effortlessly.
                            </StyledText>
                            <StyledBox>
                                <StyledLink to="/Login">
                                    <LightPurpleButton 
                                        variant="contained" 
                                        fullWidth
                                        size={isSmallMobile ? "medium" : "large"}
                                    >
                                        Login
                                    </LightPurpleButton>
                                </StyledLink>
                            </StyledBox>
                        </ContentWrapper>
                    </StyledPaper>
                </Grid>
            </Grid>
        </StyledContainer>
    );
};

export default Homepage;

const StyledContainer = styled(Container)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 0;

  @media (max-width: 768px) {
    height: auto;
    min-height: 100vh;
    padding: 20px 0;
  }

  @media (max-width: 480px) {
    padding: 10px 0;
  }
`;

const StyledPaper = styled.div`
  padding: 24px;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    height: auto;
    padding: 40px 24px;
  }

  @media (max-width: 480px) {
    padding: 30px 16px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 500px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const ImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 40px;

  img {
    width: 100%;
    max-width: 600px;
    height: auto;
  }

  @media (max-width: 768px) {
    height: auto;
    padding: 40px 20px 20px;
    
    img {
      max-width: 400px;
    }
  }

  @media (max-width: 480px) {
    padding: 30px 16px 10px;
    
    img {
      max-width: 300px;
    }
  }
`;

const StyledBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 20px 0;
  }

  @media (max-width: 480px) {
    padding: 16px 0;
    gap: 12px;
  }
`;

const StyledTitle = styled.h1`
  font-size: clamp(1.8rem, 5vw, 3rem);
  color: #252525;
  font-weight: bold;
  padding-top: 0;
  letter-spacing: normal;
  line-height: 1.2;
  margin-bottom: 24px;
  
  /* Text wrapping properties */
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;

  @media (max-width: 1024px) {
    font-size: 2.5rem;
  }

  @media (max-width: 768px) {
    line-height: 1.3;
    letter-spacing: 0.5px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    line-height: 1.4;
    letter-spacing: 0.3px;
    margin-bottom: 16px;
    font-size: clamp(1.5rem, 6vw, 2rem);
  }

  @media (max-width: 360px) {
    line-height: 1.5;
    letter-spacing: 0.2px;
  }
`;

const StyledText = styled.p`
  color: #666;
  margin-top: 30px;
  margin-bottom: 30px;
  letter-spacing: normal;
  line-height: 1.6;
  font-size: 1.1rem;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-top: 20px;
    margin-bottom: 25px;
    line-height: 1.5;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
    margin-top: 16px;
    margin-bottom: 20px;
    line-height: 1.4;
  }

  @media (max-width: 360px) {
    font-size: 0.9rem;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  width: 100%;
  max-width: 300px;

  @media (max-width: 480px) {
    max-width: 100%;
  }
`;