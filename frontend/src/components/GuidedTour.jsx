import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const GuidedTour = ({ steps, tourKey }) => {
  useEffect(() => {
    if (!steps || steps.length === 0) return;

    const hasSeenTour = localStorage.getItem(`tour_seen_${tourKey}`);
    if (hasSeenTour) return;

    // Small delay to ensure all DOM elements are mounted and stable
    const timer = setTimeout(() => {
      // Check if the targets actually exist before starting to prevent freezing
      const targetsExist = steps.some(step => document.querySelector(step.target));
      if (!targetsExist) return;

      const driverSteps = steps.map(step => ({
        element: step.target,
        popover: {
          title: step.title,
          description: step.content,
          side: step.placement || 'bottom',
          align: 'start'
        }
      }));

      const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        doneBtnText: 'Finish',
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        popoverClass: 'driverjs-theme', // We will add a quick global CSS rule for the primary color
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep() || confirm("Are you sure you want to skip the rest of the tutorial?")) {
            localStorage.setItem(`tour_seen_${tourKey}`, 'true');
            driverObj.destroy();
          }
        },
      });

      driverObj.setSteps(driverSteps);
      driverObj.drive();
    }, 500);

    return () => clearTimeout(timer);
  }, [tourKey, steps]);

  return null;
};

export default GuidedTour;
