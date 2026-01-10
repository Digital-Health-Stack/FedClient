import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CoachMarksOverlay - Displays all feature highlights simultaneously
 * with a semi-transparent backdrop and spotlight cutouts.
 *
 * @param {boolean} isVisible - Whether the overlay is visible
 * @param {function} onDismiss - Callback when overlay is dismissed
 * @param {Array} steps - Array of step objects with { target, content, placement }
 * @param {string} title - Optional custom header title
 * @param {string} subtitle - Optional custom header subtitle
 */
const CoachMarksOverlay = ({
  isVisible,
  onDismiss,
  steps = [],
  title = "Quick Tour",
  subtitle = "Here's a quick overview of the main features"
}) => {
  const [spotlights, setSpotlights] = useState([]);
  const [tooltips, setTooltips] = useState([]);

  // Calculate positions of all target elements
  const calculatePositions = useCallback(() => {
    const newSpotlights = [];
    const newTooltips = [];

    steps.forEach((step, index) => {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Allow per-step spotlight padding (in pixels). Defaults to 0.
        const padding =
          typeof step.padding === "number" ? step.padding : 0;

        // Spotlight position
        newSpotlights.push({
          id: index,
          x: rect.left - padding,
          y: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          borderRadius: 12,
        });

        // Tooltip position calculation with smart placement
        const tooltipWidth = 220;
        const tooltipHeight = 70;
        const arrowSize = 10;
        const gap = 16;

        let tooltipX, tooltipY, arrowDirection;
        const placement = step.placement || "auto";

        // Determine best placement
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const spaceRight = viewportWidth - rect.right;
        const spaceLeft = rect.left;
        const spaceBottom = viewportHeight - rect.bottom;
        const spaceTop = rect.top;

        let finalPlacement = placement;
        if (placement === "auto") {
          // Choose best placement based on available space
          if (spaceBottom > tooltipHeight + gap) {
            finalPlacement = "bottom";
          } else if (spaceTop > tooltipHeight + gap) {
            finalPlacement = "top";
          } else if (spaceRight > tooltipWidth + gap) {
            finalPlacement = "right";
          } else if (spaceLeft > tooltipWidth + gap) {
            finalPlacement = "left";
          } else {
            finalPlacement = "bottom";
          }
        }

        switch (finalPlacement) {
          case "top":
            tooltipX = rect.left + rect.width / 2 - tooltipWidth / 2;
            tooltipY = rect.top - tooltipHeight - gap - arrowSize;
            arrowDirection = "down";
            break;
          case "bottom":
            tooltipX = rect.left + rect.width / 2 - tooltipWidth / 2;
            tooltipY = rect.bottom + gap;
            arrowDirection = "up";
            break;
          case "left":
            tooltipX = rect.left - tooltipWidth - gap - arrowSize;
            tooltipY = rect.top + rect.height / 2 - tooltipHeight / 2;
            arrowDirection = "right";
            break;
          case "right":
            tooltipX = rect.right + gap;
            tooltipY = rect.top + rect.height / 2 - tooltipHeight / 2 + 25;
            arrowDirection = "left";
            break;
          default:
            tooltipX = rect.left + rect.width / 2 - tooltipWidth / 2;
            tooltipY = rect.bottom + gap;
            arrowDirection = "up";
        }

        // Clamp tooltip position to viewport
        tooltipX = Math.max(16, Math.min(tooltipX, viewportWidth - tooltipWidth - 16));
        tooltipY = Math.max(16, Math.min(tooltipY, viewportHeight - tooltipHeight - 100));

        newTooltips.push({
          id: index,
          x: tooltipX,
          y: tooltipY,
          width: tooltipWidth,
          content: step.content,
          arrowDirection,
          targetRect: rect,
        });
      }
    });

    setSpotlights(newSpotlights);
    setTooltips(newTooltips);
  }, [steps]);

  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(calculatePositions, 100);

      // Recalculate on resize
      window.addEventListener("resize", calculatePositions);
      window.addEventListener("scroll", calculatePositions);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", calculatePositions);
        window.removeEventListener("scroll", calculatePositions);
      };
    }
  }, [isVisible, calculatePositions]);

  // Generate SVG mask path for spotlights
  const generateMaskPath = () => {
    if (spotlights.length === 0) return "";

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Start with full viewport rectangle
    let path = `M 0 0 L ${viewportWidth} 0 L ${viewportWidth} ${viewportHeight} L 0 ${viewportHeight} Z `;

    // Cut out each spotlight
    spotlights.forEach((spot) => {
      const r = spot.borderRadius;
      const { x, y, width, height } = spot;

      // Rounded rectangle cutout (counterclockwise to create hole)
      path += `M ${x + r} ${y} `;
      path += `L ${x + width - r} ${y} `;
      path += `Q ${x + width} ${y} ${x + width} ${y + r} `;
      path += `L ${x + width} ${y + height - r} `;
      path += `Q ${x + width} ${y + height} ${x + width - r} ${y + height} `;
      path += `L ${x + r} ${y + height} `;
      path += `Q ${x} ${y + height} ${x} ${y + height - r} `;
      path += `L ${x} ${y + r} `;
      path += `Q ${x} ${y} ${x + r} ${y} Z `;
    });

    return path;
  };

  // Arrow component for tooltips
  const Arrow = ({ direction, className = "" }) => {
    const arrowStyles = {
      up: "border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white",
      down: "border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white",
      left: "border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[10px] border-r-white",
      right: "border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[10px] border-l-white",
    };

    return <div className={`w-0 h-0 ${arrowStyles[direction]} ${className}`} />;
  };

  if (!isVisible) return null;

  const overlayContent = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999]"
          onClick={onDismiss}
        >
          {/* SVG Mask Overlay */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "none" }}
          >
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                {spotlights.map((spot) => (
                  <rect
                    key={spot.id}
                    x={spot.x}
                    y={spot.y}
                    width={spot.width}
                    height={spot.height}
                    rx={spot.borderRadius}
                    fill="black"
                  />
                ))}
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.75)"
              mask="url(#spotlight-mask)"
            />
          </svg>

          {/* Spotlight borders (glow effect) */}
          {spotlights.map((spot) => (
            <motion.div
              key={`border-${spot.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="absolute pointer-events-none"
              style={{
                left: spot.x,
                top: spot.y,
                width: spot.width,
                height: spot.height,
                borderRadius: spot.borderRadius,
                border: "2px solid rgba(99, 102, 241, 0.8)",
                boxShadow: "0 0 20px rgba(99, 102, 241, 0.4), inset 0 0 20px rgba(99, 102, 241, 0.1)",
              }}
            />
          ))}

          {/* Tooltips */}
          {tooltips.map((tooltip, index) => (
            <motion.div
              key={`tooltip-${tooltip.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
              className="absolute pointer-events-none"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                width: tooltip.width,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Arrow pointing up */}
              {tooltip.arrowDirection === "up" && (
                <div className="flex justify-center -mb-[1px]">
                  <Arrow direction="up" />
                </div>
              )}

              <div className="flex items-start">
                {/* Arrow pointing left */}
                {tooltip.arrowDirection === "left" && (
                  <div className="flex items-center -mr-[1px]">
                    <Arrow direction="left" />
                  </div>
                )}

                {/* Tooltip content */}
                <div className={`bg-white shadow-2xl p-3 flex-1 ${tooltip.arrowDirection === "left"
                    ? "rounded-r-lg"
                    : tooltip.arrowDirection === "right"
                      ? "rounded-l-lg"
                      : "rounded-lg"
                  }`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 text-xs leading-relaxed">
                      {tooltip.content}
                    </p>
                  </div>
                </div>

                {/* Arrow pointing right */}
                {tooltip.arrowDirection === "right" && (
                  <div className="flex items-center -ml-[1px]">
                    <Arrow direction="right" />
                  </div>
                )}
              </div>

              {/* Arrow pointing down */}
              {tooltip.arrowDirection === "down" && (
                <div className="flex justify-center -mt-[1px]">
                  <Arrow direction="down" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Dismiss Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="fixed bottom-8 inset-x-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white text-sm opacity-80 text-center">
              Click anywhere or the button below to dismiss
            </p>
            <button
              onClick={onDismiss}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 pointer-events-auto"
            >
              Got it!
            </button>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="fixed top-6 inset-x-0 flex flex-col items-center justify-center text-center pointer-events-none"
          >
            <h2 className="text-white text-2xl font-bold mb-2">
              {title}
            </h2>
            <p className="text-white/80 text-sm">
              {subtitle}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render using portal to ensure overlay is above everything
  return createPortal(overlayContent, document.body);
};

export default CoachMarksOverlay;




