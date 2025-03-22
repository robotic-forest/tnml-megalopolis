import React, { useState, useEffect } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import renoviantLogo from './assets/RV-symbol.png';
import Graphic from './Graphic';

const ColorControl = ({ baseColor, boxColor, onChange }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
      <button 
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 px-4 py-2 bg-white rounded-lg shadow-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {isVisible ? 'Hide Controls' : 'Show Controls'}
      </button>
      {isVisible && (
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-700">Base Color</label>
              <input 
                type="color" 
                value={baseColor}
                onChange={(e) => onChange('base', e.target.value)}
                className="w-full h-10 cursor-pointer rounded"
              />
              <div className="text-xs text-gray-500">
                Current: {baseColor}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700">Helix Box Color</label>
              <input 
                type="color" 
                value={boxColor}
                onChange={(e) => onChange('box', e.target.value)}
                className="w-full h-10 cursor-pointer rounded"
              />
              <div className="text-xs text-gray-500">
                Current: {boxColor}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const generateColorPalette = (baseColor) => {
  // Convert hex to HSL for easier manipulation
  const hexToHSL = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  const HSLToHex = (h, s, l) => {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const [h, s, l] = hexToHSL(baseColor);
  
  // Reduce saturation more aggressively for darker shades
  const baseSaturation = Math.min(s, 70); // Cap base saturation at 30%
  
  return {
    base: baseColor,
    lighter: HSLToHex(h, Math.max(0, baseSaturation - 5), Math.min(100, l + 5)),
    darker: HSLToHex(h, Math.max(0, baseSaturation - 10), Math.max(0, l - 5)),
    lightest: HSLToHex(h, Math.max(0, baseSaturation - 10), Math.min(100, l + 10)),
    darkest: HSLToHex(h, Math.max(0, baseSaturation - 10), Math.max(0, l - 10))
  };
};

const Section = ({ title, children, className = '', backgroundColor }) => (
  <section className={`w-full relative ${className}`}
    style={{ backgroundColor }}>
    <div className="max-w-6xl mx-auto px-6 py-16 pb-20">
      {title && (
        <h2 className="text-2xl font-medium mb-8 text-gray-800 ">
          {title}
        </h2>
      )}
      <div className="w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  </section>
);

const ValueCard = ({ title, description, backgroundColor }) => (
  <div 
    className="p-10 rounded-2xl w-full transition-colors duration-300"
    style={{ backgroundColor }}
  >
    <h3 className="text-xl font-medium mb-4 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const BusinessPillar = ({ title, description, backgroundColor }) => {
  // Extract and lighten the color for gradient
  const lightenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `#${(1 << 24 | (R < 255 ? R < 1 ? 0 : R : 255) << 16 | (G < 255 ? G < 1 ? 0 : G : 255) << 8 | (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)}`;
  };

  const lighterColor = lightenColor(backgroundColor, 5);

  return (
    <div 
      className="p-10 rounded-2xl mb-4 w-full transition-colors duration-300"
      style={{ 
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${lighterColor} 100%)`
      }}
    >
      <h3 className="text-xl font-medium mb-8 text-gray-800">{title}</h3>
      <p className="text-lg">{description}</p>
    </div>
  );
};

const NavLink = ({ href, children }) => (
  <a 
    href={href} 
    className="text-gray-900 hover:text-black px-4 py-2 text-sm transition-colors duration-200"
    onClick={(e) => {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }}
  >
    {children}
  </a>
);

const Header = ({ backgroundColor }) => (
  <header className="fixed top-0 left-0 right-0 backdrop-blur-sm z-50" style={{ backgroundColor }}>
    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={renoviantLogo} alt="Renoviant Logo" className="w-5 h-5" />
        <a href="#top" className="text-2xl font-light text-black">
          Renoviant
        </a>
      </div>
      <nav className="flex items-center gap-2">
        <NavLink href="#mission">Mission</NavLink>
        <NavLink href="#values">Values</NavLink>
        <NavLink href="#pillars">Business</NavLink>
        <NavLink href="#contact">Contact</NavLink>
      </nav>
    </div>
  </header>
);

const ContactCard = ({ icon, title, content, backgroundColor }) => (
  <div 
    className="p-8 rounded-2xl flex flex-col transition-colors duration-300"
    style={{ backgroundColor }}
  >
    <div className="flex items-center mb-10 w-full">
      <div className="w-12 h-12 flex items-center justify-center bg-black bg-opacity-10 rounded-lg">
        {icon}
      </div>
      <h3 className="text-lg font-medium ml-6">{title}</h3>
    </div>
    <div className="text-lg">
      {content}
    </div>
  </div>
);

const Renoviant3 = () => {
  const [baseColor, setBaseColor] = useState('#cadfe7');
  const [boxColor, setBoxColor] = useState('#ff7a33');
  const colors = generateColorPalette(baseColor);

  useEffect(() => {
    document.body.style.paddingTop = '4rem';
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.paddingTop = '0';
      document.body.style.overflowX = 'auto';
    };
  }, []);

  const handleColorChange = (type, color) => {
    if (type === 'base') {
      setBaseColor(color);
    } else if (type === 'box') {
      setBoxColor(color);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: colors.lightest }}>
      <Header backgroundColor={colors.darkest} />
      <ColorControl 
        baseColor={baseColor} 
        boxColor={boxColor}
        onChange={handleColorChange}
      />
      
      <div className="w-full">
        {/* Top anchor for home link */}
        <div id="top"></div>

        {/* Hero Section */}
        <section className="w-full relative overflow-hidden"
          style={{ background: `linear-gradient(180deg, ${colors.darkest} 0%, ${colors.base} 100%)` }}>
          <div className="max-w-6xl mx-auto px-6 py-32 relative">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              <div className="flex-1 relative z-10 pointer-events-none">
                <h1 className="text-4xl font-light mb-8 text-black pointer-events-auto">Renoviant</h1>
                <h2 className="text-6xl font-bold mb-12 text-black max-w-3xl leading-[1.1] pointer-events-auto">
                  Crafting Tomorrow's Solutions, Today
                </h2>
                <p className="text-2xl text-gray-900 max-w-2xl leading-relaxed pointer-events-auto pr-32">
                  Our mission is to facilitate renewed growth and innovation across diverse sectors, 
                  driving positive change in the global marketplace.
                </p>
              </div>
              <div className="flex-1 md:absolute md:left-[34%] md:w-[80%] md:h-full md:top-0">
                <div className="w-full h-full pointer-events-auto opacity-80">
                  <Graphic boxColor={boxColor} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <Section 
          title="Core Values"
          backgroundColor={colors.lighter}
        >
          <div id="values" className="grid gap-6 md:grid-cols-2 w-full scroll-mt-20">
            <ValueCard 
              title="Innovation"
              description="We continuously explore new technologies and approaches to enhance our offerings. We are thought leaders committed to pushing the industry forward."
              backgroundColor={colors.lightest}
            />
            <ValueCard
              title="Service Excellence"
              description="We are dedicated to providing best-in-class service customized to each customer's needs. Our customers' success is our success."
              backgroundColor={colors.lightest}
            />
            <ValueCard
              title="Collaboration"
              description="We believe the best solutions come from working together. Our diverse team and partnerships enable us to achieve more!"
              backgroundColor={colors.lightest}
            />
            <ValueCard
              title="Integrity"
              description="We uphold the highest standards of integrity and compliance in all our actions. You can count on us to always do the right thing."
              backgroundColor={colors.lightest}
            />
          </div>
        </Section>

        {/* Business Pillars */}
        <Section 
          title="Business Pillars"
          backgroundColor={colors.base}
        >
          <div id="pillars" className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full scroll-mt-20">
            <div className="md:translate-y-12">
              <BusinessPillar
                title="Renoviant Capital Management"
                description="Specializes in investment strategies aimed at generating sustainable returns and fostering financial growth for our clients."
                backgroundColor={colors.lighter}
              />
            </div>
            <div className="md:-translate-y-8">
              <BusinessPillar
                title="Renoviant Ventures"
                description="Focuses on investing in cutting-edge health and medical portfolio companies, driving innovation and advancement in the healthcare sector."
                backgroundColor={colors.lighter}
              />
            </div>
            <div className="md:translate-y-16">
              <BusinessPillar
                title="Renoviant Consulting"
                description="Provides strategic advisory services, helping businesses navigate challenges, seize opportunities, and achieve their growth objectives."
                backgroundColor={colors.lighter}
              />
            </div>
            <div className="md:-translate-y-4">
              <BusinessPillar
                title="Renoviant Tokenology"
                description="Is at the forefront of blockchain technology, offering expertise in tokenization strategies and decentralized finance solutions."
                backgroundColor={colors.lighter}
              />
            </div>
          </div>
        </Section>

        {/* Contact Information */}
        <Section 
          title="Contact Us" 
          backgroundColor={colors.lighter}
        >
          <div id="contact" className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full scroll-mt-20">
            <ContactCard
              icon={<FaPhone color='white' className="w-4 h-4" />}
              title="Phone"
              content="305.252.6889"
              backgroundColor={colors.base}
            />
            <ContactCard
              icon={<FaEnvelope color='white' className="w-4 h-4" />}
              title="Email"
              content="support@renoviant.com"
              backgroundColor={colors.base}
            />
            <ContactCard
              icon={<FaMapMarkerAlt color='white' className="w-4 h-4" />}
              title="Location"
              content="16155 SW 117 Ave #B15 Miami, FL 33177"
              backgroundColor={colors.base}
            />
            <ContactCard
              icon={<FaClock color='white' className="w-4 h-4" />}
              title="Office Hours"
              content={
                <>
                  M-F: 8am – 5pm<br />
                  S-S: 9am – 4pm
                </>
              }
              backgroundColor={colors.base}
            />
          </div>
        </Section>

        {/* Footer */}
        <footer className="w-full py-6" style={{ backgroundColor: colors.darkest }}>
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-center text-sm text-black">
              © 2024 Renoviant LLC All Rights Reserved
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Renoviant3;