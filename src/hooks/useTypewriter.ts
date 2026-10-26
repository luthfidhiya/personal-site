import { useState, useEffect } from 'react';

export const useTypewriter = (text: string, speed = 50, delay = 0) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let i = 0;

    const startTyping = () => {
      setIsTyping(true);
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, speed);

      return () => clearInterval(typingInterval);
    };

    const timeout = setTimeout(startTyping, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayText, isTyping };
};
