import React, { useState, useEffect } from 'react';

export const TypeWriterEffect = ({
  words = ["Sports", "Cultural", "Hackthons"],
  typingSpeed = 150,
  deletingSpeed = 75,
  pauseTime = 1500
}) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // 1. If we are done typing the word
    if (!isDeleting && subIndex === words[index].length) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseTime);
      return () => clearTimeout(timeout);
    }

    // 2. If we are done deleting the word
    if (isDeleting && subIndex === 0) {
      setIsDeleting(false);
      // Move to next word, or back to 0 if at the end
      setIndex((prev) => (prev + 1 === words.length ? 0 : prev + 1));
      return;
    }

    // 3. Typing/Deleting logic
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [subIndex, isDeleting, index, words]);

  return (
    <div className="flex items-center font-mangodolly md:mt-5 text-3xl md:text-6xl font-bold">
      <span className="relative text-black underline underline-offset-2 decoration-6 md:decoration-8 decoration-amber-400">
        {words[index].substring(0, subIndex) || "\u00A0"}
      </span>
    </div>
  );
};