import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './tokens.css'
import App from './App.jsx'
import DesktopApp from './desktop/DesktopApp.jsx'

const DESKTOP_BREAKPOINT = 1024;

const initialDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
if (initialDesktop) document.body.classList.add('desktop-mode');

const Root = () => {
  const [isDesktop, setIsDesktop] = useState(initialDesktop);

  useEffect(() => {
    const handler = () => {
      const desktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      setIsDesktop(desktop);
      document.body.classList.toggle('desktop-mode', desktop);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isDesktop ? <DesktopApp /> : <App />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
