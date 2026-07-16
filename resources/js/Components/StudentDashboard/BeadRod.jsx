/**
 * BeadRod - Signature abacus bead progress indicator component
 *
 * A horizontal rod with 10 beads representing progress percentage.
 * Filled beads = round(percent / 10), using the passed color.
 * Unfilled beads use the rod color (#DCE4F2).
 *
 * @param {number} percent - Progress percentage (0-100)
 * @param {string} color - CSS color for filled beads (e.g., "var(--aba-blue)" or "#3D8BFD")
 * @param {"md" | "sm"} size - Size variant: "md" (default) or "sm"
 */
export default function BeadRod({ percent = 0, color = "#3D8BFD", size = "md" }) {
    // Clamp percent between 0 and 100
    const clampedPercent = Math.max(0, Math.min(100, percent));
    // Calculate number of filled beads (0-10)
    const filledCount = Math.round(clampedPercent / 10);

    // Size-specific styles
    const isSm = size === "sm";
    const beadSize = isSm ? "w-[9px] h-[9px]" : "w-[13px] h-[13px]";
    const rodHeight = isSm ? "h-[9px]" : "h-[14px]";
    const rodBarHeight = isSm ? "h-[2px]" : "h-[3px]";
    const gap = isSm ? "gap-[3px]" : "gap-[5px]";

    return (
        <div
            className={`relative flex-1 ${rodHeight} flex items-center ${gap}`}
            role="progressbar"
            aria-valuenow={clampedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${clampedPercent}% progress`}
        >
            {/* Background rod bar */}
            <div
                className={`absolute left-0 right-0 top-1/2 ${rodBarHeight} bg-aba-rod rounded-full -translate-y-1/2`}
            />

            {/* Beads */}
            {Array.from({ length: 10 }, (_, index) => {
                const isFilled = index < filledCount;

                return (
                    <span
                        key={index}
                        className={`
                            relative flex-shrink-0 rounded-full ${beadSize}
                            ${isFilled
                                ? "shadow-[inset_0_-2px_2px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.12)]"
                                : "bg-aba-rod shadow-[inset_0_-2px_2px_rgba(0,0,0,0.06)]"
                            }
                        `}
                        style={isFilled ? { backgroundColor: color } : undefined}
                    />
                );
            })}
        </div>
    );
}
