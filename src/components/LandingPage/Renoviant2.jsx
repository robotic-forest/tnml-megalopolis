import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebookF, FaTwitter, FaInstagram, FaRss, FaArrowRight, FaChevronDown } from 'react-icons/fa';

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const floatSlow = keyframes`
  0% { transform: translate(0, 0); }
  50% { transform: translate(15px, -15px); }
  100% { transform: translate(0, 0); }
`;

const floatMedium = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-10px, 10px) rotate(5deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Colors
const colors = {
  primary: '#0e4f80',
  secondary: '#0a2c4c',
  accent: '#4085bf',
  light: '#e6f0fa',
  white: '#ffffff',
  text: '#2d3748',
  textLight: '#718096',
  gray: '#f7fafc',
  darkGray: '#4a5568',
};

// Styled Components with drastically changed design
const PageContainer = styled.div`
  font-family: 'Inter', 'Roboto', sans-serif;
  color: ${colors.text};
  background-color: ${colors.gray};
  overflow-x: hidden;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const SectionContainer = styled.section`
  position: relative;
  padding: 8rem 2rem;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 5rem 1.5rem;
  }
`;

const ShapeElement = styled.div`
  position: absolute;
  border-radius: 50%;
  background: ${props => props.bg || 'rgba(14, 79, 128, 0.03)'};
  z-index: 0;
  animation: ${floatSlow} ${props => props.duration || '20s'} ease-in-out infinite;
  filter: blur(${props => props.blur || '0px'});
`;

const AbsoluteShape = styled.div`
  position: absolute;
  z-index: 0;
  opacity: ${props => props.opacity || 0.5};
`;

const HeroSection = styled(SectionContainer)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${colors.white};
  position: relative;
  padding: 0 2rem;
`;

const HeroGradientOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(14, 79, 128, 0.05) 0%, rgba(10, 44, 76, 0.02) 100%);
  z-index: 1;
`;

const GlassPanelHero = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 4rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(10, 44, 76, 0.1);
  width: 90%;
  max-width: 1100px;
  z-index: 2;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(45deg);
    animation: ${shimmer} 10s infinite linear;
  }
  
  @media (max-width: 768px) {
    padding: 2.5rem 1.5rem;
    width: 95%;
  }
`;

const CompanyName = styled.h1`
  font-size: 5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const TagLine = styled.h2`
  font-size: 1.8rem;
  font-weight: 300;
  margin-bottom: 2rem;
  color: ${colors.textLight};
  max-width: 700px;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: ${colors.white};
  color: ${colors.primary};
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(10, 44, 76, 0.1);
  cursor: pointer;
  z-index: 3;
  animation: ${pulse} 2s infinite ease-in-out;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${colors.primary};
    color: ${colors.white};
    transform: translateX(-50%) translateY(-5px);
  }
`;

const SectionTitle = styled.h2`
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
  color: ${colors.primary};
  position: relative;
  font-weight: 600;
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  text-align: center;
  max-width: 700px;
  margin: 0 auto 4rem;
  color: ${colors.textLight};
`;

// Sections with alternating backgrounds
const LightSection = styled(SectionContainer)`
  background-color: ${colors.white};
`;

const DarkSection = styled(SectionContainer)`
  background-color: ${colors.secondary};
  color: ${colors.white};
`;

const GradientSection = styled(SectionContainer)`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  color: ${colors.white};
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  z-index: 2;
  position: relative;
`;

// New card design - glassmorphism with no side lines
const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(10, 44, 76, 0.1);
  position: relative;
  overflow: hidden;
  z-index: 1;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 40px rgba(10, 44, 76, 0.15);
  }
`;

const DarkGlassCard = styled(GlassCard)`
  background: rgba(10, 44, 76, 0.7);
  color: ${colors.white};
  
  &:hover {
    background: rgba(10, 44, 76, 0.8);
  }
`;

const IconContainer = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%);
  color: ${colors.white};
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: ${props => props.dark ? colors.white : colors.primary};
`;

const CardContent = styled.p`
  color: ${props => props.dark ? colors.light : colors.textLight};
  line-height: 1.7;
  font-size: 1rem;
`;

// Quote section
const QuoteContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const Quote = styled.blockquote`
  font-size: 2.2rem;
  font-weight: 300;
  line-height: 1.5;
  position: relative;
  margin: 0;
  padding: 0 2rem;
  
  &:before, &:after {
    content: "";
    position: absolute;
    width: 40px;
    height: 40px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='none' d='M0 0h24v24H0z'/%3E%3Cpath d='M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z' fill='rgba(255,255,255,0.2)'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-size: contain;
    opacity: 0.5;
  }
  
  &:before {
    left: 0;
    top: 0;
  }
  
  &:after {
    right: 0;
    bottom: 0;
    transform: rotate(180deg);
  }
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

// Contact styles
const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const ContactCard = styled(GlassCard)`
  text-align: center;
  align-items: center;
`;

const ContactIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%);
  color: ${colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  box-shadow: 0 10px 20px rgba(14, 79, 128, 0.2);
`;

const ContactTitle = styled.h3`
  color: ${colors.primary};
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const ContactInfo = styled.p`
  color: ${colors.textLight};
`;

// New button styles
const Button = styled.a`
  display: inline-block;
  background: ${props => props.outline ? 'transparent' : 'linear-gradient(135deg, #0e4f80 0%, #4085bf 100%)'};
  color: ${props => props.outline ? colors.primary : colors.white};
  padding: 1rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 100px;
  margin-top: 2rem;
  text-decoration: none;
  transition: all 0.3s ease;
  border: ${props => props.outline ? `2px solid ${colors.primary}` : 'none'};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  z-index: 1;
  box-shadow: ${props => props.outline ? 'none' : '0 10px 25px rgba(14, 79, 128, 0.25)'};
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 75%);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.outline ? 'none' : '0 15px 30px rgba(14, 79, 128, 0.3)'};
    background: ${props => props.outline ? colors.primary : 'linear-gradient(135deg, #0c4570 0%, #3075ac 100%)'};
    color: ${colors.white};
    
    &:before {
      left: 100%;
    }
  }
  
  svg {
    margin-left: 8px;
    transition: transform 0.3s ease;
    vertical-align: middle;
  }
  
  &:hover svg {
    transform: translateX(5px);
  }
`;

// Footer
const Footer = styled.footer`
  background: ${colors.secondary};
  color: ${colors.white};
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const FooterContent = styled.div`
  position: relative;
  z-index: 2;
`;

const Copyright = styled.div`
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  opacity: 0.7;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const SocialIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${colors.accent};
    transform: translateY(-3px);
  }
`;

// Company Structure
const StructureContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  position: relative;
  z-index: 2;
`;

const StructureItem = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  width: calc(50% - 2rem);
  max-width: 280px;
  text-align: center;
  box-shadow: 0 15px 35px rgba(14, 79, 128, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(14, 79, 128, 0.15);
  }
  
  &:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, ${colors.primary}, ${colors.accent});
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  
  &:hover:after {
    transform: scaleX(1);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
  }
`;

const StructureTitle = styled.h3`
  color: ${colors.primary};
  font-weight: 600;
  font-size: 1.3rem;
`;

// Main component
const Renoviant2 = () => {
  const [isVisible, setIsVisible] = useState({});
  const sectionRefs = useRef({});
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      }, 
      { threshold: 0.1 }
    );
    
    document.querySelectorAll('section[id]').forEach(section => {
      if (section.id) {
        observer.observe(section);
        sectionRefs.current[section.id] = section;
      }
    });
    
    return () => observer.disconnect();
  }, []);
  
  const scrollToSection = (sectionId) => {
    if (sectionRefs.current[sectionId]) {
      sectionRefs.current[sectionId].scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <PageContainer>
      {/* Hero Section */}
      <HeroSection id="hero">
        {/* Abstract shapes background */}
        <ShapeElement 
          style={{
            top: '10%', 
            left: '10%', 
            width: '600px', 
            height: '600px',
            background: `radial-gradient(circle, rgba(64, 133, 191, 0.08) 0%, rgba(64, 133, 191, 0) 70%)`,
            blur: '80px'
          }}
          duration="25s"
        />
        <ShapeElement 
          style={{
            bottom: '15%', 
            right: '5%', 
            width: '500px', 
            height: '500px',
            background: `radial-gradient(circle, rgba(10, 44, 76, 0.05) 0%, rgba(10, 44, 76, 0) 70%)`,
            blur: '70px'
          }}
          duration="20s"
        />
        <AbsoluteShape
          style={{
            top: '20%',
            right: '15%',
            width: '200px',
            height: '200px',
            background: `rgba(14, 79, 128, 0.02)`,
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            animation: `${floatMedium} 15s infinite ease-in-out`
          }}
          opacity={0.7}
        />
        <AbsoluteShape
          style={{
            bottom: '15%',
            left: '10%',
            width: '300px',
            height: '300px',
            background: `rgba(64, 133, 191, 0.03)`,
            borderRadius: '64% 36% 27% 73% / 55% 58% 42% 45%',
            animation: `${floatMedium} 18s infinite ease-in-out`
          }}
          opacity={0.5}
        />
        
        <HeroGradientOverlay />
        
        <GlassPanelHero>
          <CompanyName>Renoviant</CompanyName>
          <TagLine>Crafting Tomorrow's Solutions, Today</TagLine>
          <Button onClick={() => scrollToSection('about')}>
            Learn More <FaArrowRight />
          </Button>
        </GlassPanelHero>
        
        <ScrollIndicator onClick={() => scrollToSection('values')}>
          <FaChevronDown />
        </ScrollIndicator>
      </HeroSection>
      
      {/* Values Section */}
      <LightSection id="values">
        {/* Background Elements */}
        <ShapeElement 
          style={{
            top: '-10%', 
            right: '-5%', 
            width: '500px', 
            height: '500px',
            background: `radial-gradient(circle, rgba(14, 79, 128, 0.03) 0%, rgba(14, 79, 128, 0) 70%)`,
            blur: '60px'
          }}
          duration="28s"
        />
        <ShapeElement 
          style={{
            bottom: '10%', 
            left: '-5%', 
            width: '400px', 
            height: '400px',
            background: `radial-gradient(circle, rgba(64, 133, 191, 0.04) 0%, rgba(64, 133, 191, 0) 60%)`,
            blur: '50px'
          }}
          duration="22s"
        />
        
        <SectionTitle>Our Core Values</SectionTitle>
        <SectionSubtitle>
          The principles that guide our work and define our approach to creating value for our clients.
        </SectionSubtitle>
        
        <CardsContainer>
          <GlassCard>
            <IconContainer>🚀</IconContainer>
            <CardTitle>Innovation</CardTitle>
            <CardContent>
              We continuously explore new technologies and approaches to enhance our offerings. 
              We are thought leaders committed to pushing the industry forward.
            </CardContent>
          </GlassCard>
          
          <GlassCard>
            <IconContainer>⭐</IconContainer>
            <CardTitle>Service Excellence</CardTitle>
            <CardContent>
              We are dedicated to providing best-in-class service customized to each customer's needs. 
              Our customers' success is our success.
            </CardContent>
          </GlassCard>
          
          <GlassCard>
            <IconContainer>🤝</IconContainer>
            <CardTitle>Collaboration</CardTitle>
            <CardContent>
              We believe the best solutions come from working together. 
              Our diverse team and partnerships enable us to achieve more!
            </CardContent>
          </GlassCard>
          
          <GlassCard>
            <IconContainer>🛡️</IconContainer>
            <CardTitle>Integrity</CardTitle>
            <CardContent>
              We uphold the highest standards of integrity and compliance in all our actions. 
              You can count on us to always do the right thing.
            </CardContent>
          </GlassCard>
        </CardsContainer>
      </LightSection>
      
      {/* Company Structure */}
      <GradientSection id="structure">
        {/* Background Elements */}
        <AbsoluteShape
          style={{
            top: '10%',
            left: '5%',
            width: '250px',
            height: '250px',
            background: `rgba(255, 255, 255, 0.03)`,
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            animation: `${floatMedium} 20s infinite ease-in-out`
          }}
        />
        <AbsoluteShape
          style={{
            bottom: '15%',
            right: '10%',
            width: '350px',
            height: '350px',
            background: `rgba(255, 255, 255, 0.02)`,
            borderRadius: '64% 36% 27% 73% / 55% 58% 42% 45%',
            animation: `${floatMedium} 25s infinite ease-in-out`
          }}
        />
        
        <SectionTitle style={{ color: colors.white }}>Company Structure</SectionTitle>
        <SectionSubtitle style={{ color: colors.light }}>
          Renoviant, Inc. is a dynamic corporation fostering renewed growth through its diverse business pillars.
        </SectionSubtitle>
        
        <StructureContainer>
          <StructureItem>
            <StructureTitle>Capital Management</StructureTitle>
          </StructureItem>
          <StructureItem>
            <StructureTitle>Ventures</StructureTitle>
          </StructureItem>
          <StructureItem>
            <StructureTitle>Consulting</StructureTitle>
          </StructureItem>
          <StructureItem>
            <StructureTitle>Tokenology</StructureTitle>
          </StructureItem>
        </StructureContainer>
      </GradientSection>
      
      {/* About Us */}
      <LightSection id="about">
        {/* Background Elements */}
        <ShapeElement 
          style={{
            top: '20%', 
            right: '10%', 
            width: '600px', 
            height: '600px',
            background: `radial-gradient(circle, rgba(14, 79, 128, 0.03) 0%, rgba(14, 79, 128, 0) 70%)`,
            blur: '70px'
          }}
          duration="24s"
        />
        
        <SectionTitle>About Us</SectionTitle>
        <SectionSubtitle>
          Renoviant, Inc. is committed to excellence in every facet of its operations.
        </SectionSubtitle>
        
        <QuoteContainer>
          <GlassCard style={{padding: '3.5rem', textAlign: 'center'}}>
            <p style={{color: colors.textLight, marginBottom: '2rem', fontSize: '1.1rem'}}>
              Our team consists of industry experts with decades of combined experience, ready to help you navigate complex challenges and seize opportunities for growth.
            </p>
            <Button outline>Meet Our Team <FaArrowRight /></Button>
          </GlassCard>
        </QuoteContainer>
      </LightSection>
      
      {/* Mission Statement */}
      <DarkSection id="mission">
        {/* Background Elements */}
        <AbsoluteShape
          style={{
            top: '20%',
            left: '10%',
            width: '300px',
            height: '300px',
            background: `rgba(255, 255, 255, 0.02)`,
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            animation: `${floatMedium} 18s infinite ease-in-out`
          }}
        />
        <AbsoluteShape
          style={{
            bottom: '15%',
            right: '8%',
            width: '250px',
            height: '250px',
            background: `rgba(255, 255, 255, 0.01)`,
            borderRadius: '64% 36% 27% 73% / 55% 58% 42% 45%',
            animation: `${floatMedium} 22s infinite ease-in-out`
          }}
        />
        
        <SectionTitle style={{ color: colors.white }}>Our Mission</SectionTitle>
        
        <QuoteContainer>
          <Quote>
            Our mission is to facilitate renewed growth and innovation across diverse sectors, 
            driving positive change in the global marketplace.
          </Quote>
        </QuoteContainer>
      </DarkSection>
      
      {/* Business Pillars */}
      <LightSection id="pillars">
        {/* Background Elements */}
        <ShapeElement 
          style={{
            top: '5%', 
            left: '5%', 
            width: '500px', 
            height: '500px',
            background: `radial-gradient(circle, rgba(14, 79, 128, 0.03) 0%, rgba(14, 79, 128, 0) 70%)`,
            blur: '60px'
          }}
          duration="26s"
        />
        <ShapeElement 
          style={{
            bottom: '5%', 
            right: '5%', 
            width: '450px', 
            height: '450px',
            background: `radial-gradient(circle, rgba(64, 133, 191, 0.04) 0%, rgba(64, 133, 191, 0) 70%)`,
            blur: '50px'
          }}
          duration="20s"
        />
        
        <SectionTitle>Business Pillars</SectionTitle>
        <SectionSubtitle>
          Our diverse set of services designed to meet the evolving needs of our clients.
        </SectionSubtitle>
        
        <CardsContainer>
          <GlassCard>
            <CardTitle>Renoviant Capital Management</CardTitle>
            <CardContent>
              Specializes in investment strategies aimed at generating sustainable returns and 
              fostering financial growth for our clients.
            </CardContent>
          </GlassCard>
          
          <GlassCard>
            <CardTitle>Renoviant Ventures</CardTitle>
            <CardContent>
              Focuses on investing in cutting-edge health and medical portfolio companies, 
              driving innovation and advancement in the healthcare sector.
            </CardContent>
          </GlassCard>
          
          <GlassCard>
            <CardTitle>Renoviant Consulting</CardTitle>
            <CardContent>
              Provides strategic advisory services, helping businesses navigate challenges, 
              seize opportunities, and achieve their growth objectives.
            </CardContent>
          </GlassCard>
          
          <GlassCard>
            <CardTitle>Renoviant Tokenology</CardTitle>
            <CardContent>
              Is at the forefront of blockchain technology, offering expertise in tokenization 
              strategies and decentralized finance solutions.
            </CardContent>
          </GlassCard>
        </CardsContainer>
      </LightSection>
      
      {/* Contact Section */}
      <GradientSection id="contact">
        {/* Background Elements */}
        <AbsoluteShape
          style={{
            top: '15%',
            left: '8%',
            width: '280px',
            height: '280px',
            background: `rgba(255, 255, 255, 0.02)`,
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            animation: `${floatMedium} 22s infinite ease-in-out`
          }}
        />
        <AbsoluteShape
          style={{
            bottom: '10%',
            right: '12%',
            width: '320px',
            height: '320px',
            background: `rgba(255, 255, 255, 0.03)`,
            borderRadius: '64% 36% 27% 73% / 55% 58% 42% 45%',
            animation: `${floatMedium} 24s infinite ease-in-out`
          }}
        />
        
        <SectionTitle style={{ color: colors.white }}>Contact Us</SectionTitle>
        <SectionSubtitle style={{ color: colors.light }}>
          We're here to answer your questions and help you achieve your goals.
        </SectionSubtitle>
        
        <ContactGrid>
          <ContactCard>
            <ContactIcon>
              <FaPhone />
            </ContactIcon>
            <ContactTitle>Phone</ContactTitle>
            <ContactInfo>305.252.6889</ContactInfo>
          </ContactCard>
          
          <ContactCard>
            <ContactIcon>
              <FaEnvelope />
            </ContactIcon>
            <ContactTitle>Email</ContactTitle>
            <ContactInfo>support@renoviant.com</ContactInfo>
          </ContactCard>
          
          <ContactCard>
            <ContactIcon>
              <FaMapMarkerAlt />
            </ContactIcon>
            <ContactTitle>Location</ContactTitle>
            <ContactInfo>16155 SW 117 Ave #B15 Miami, FL 33177</ContactInfo>
          </ContactCard>
          
          <ContactCard>
            <ContactIcon>
              <FaClock />
            </ContactIcon>
            <ContactTitle>Office Hours</ContactTitle>
            <ContactInfo>M-F: 8am – 5pm<br/>S-S: 9am – 4pm</ContactInfo>
          </ContactCard>
        </ContactGrid>
      </GradientSection>
      
      {/* Footer */}
      <Footer>
        {/* Background Elements */}
        <ShapeElement 
          style={{
            top: '40%', 
            left: '10%', 
            width: '300px', 
            height: '300px',
            background: `radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 70%)`,
            blur: '50px'
          }}
          duration="30s"
        />
        
        <FooterContent>
          <Copyright>
            © 2025 Renoviant LLC All Rights Reserved
          </Copyright>
          <SocialLinks>
            <SocialIcon href="#" aria-label="Facebook">
              <FaFacebookF />
            </SocialIcon>
            <SocialIcon href="#" aria-label="Twitter">
              <FaTwitter />
            </SocialIcon>
            <SocialIcon href="#" aria-label="Instagram">
              <FaInstagram />
            </SocialIcon>
            <SocialIcon href="#" aria-label="RSS Feed">
              <FaRss />
            </SocialIcon>
          </SocialLinks>
        </FooterContent>
      </Footer>
    </PageContainer>
  );
};

export default Renoviant2;