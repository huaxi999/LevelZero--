const positiveInteger = (value, fallback = 1) => Math.max(1, Math.floor(Number(value) || fallback));

export const getPeakSpriteActionDuration = (frames, fps, speed = 1) => {
    const naturalDuration = positiveInteger(frames) / Math.max(1, Number(fps) || 1) * 1000;
    return Math.max(160, Math.min(520, naturalDuration) / Math.max(1, Number(speed) || 1));
};

export const getPeakSpriteFrameLayout = ({ columns = 1, rows = 1, frames, duration = 1000, sheetWidth = 0, sheetHeight = 0 } = {}) => {
    const safeColumns = positiveInteger(columns);
    const safeRows = positiveInteger(rows);
    const safeFrames = Math.min(positiveInteger(frames, safeColumns * safeRows), safeColumns * safeRows);
    const safeDuration = Math.max(1, Number(duration) || 1000);
    const frameDuration = safeDuration / safeFrames;
    const sourceWidth = Math.max(0, Number(sheetWidth) || 0);
    const sourceHeight = Math.max(0, Number(sheetHeight) || 0);
    const aspectRatio = sourceWidth && sourceHeight
        ? (sourceWidth / safeColumns) / (sourceHeight / safeRows)
        : .75;
    return {
        columns: safeColumns,
        rows: safeRows,
        frames: safeFrames,
        duration: safeDuration,
        frameDuration,
        aspectRatio,
        cells: Array.from({ length: safeFrames }, (_, index) => {
            const column = index % safeColumns;
            const row = Math.floor(index / safeColumns);
            return {
                index,
                column,
                row,
                x: safeColumns === 1 ? 0 : column / (safeColumns - 1) * 100,
                y: safeRows === 1 ? 0 : row / (safeRows - 1) * 100,
                delay: index * frameDuration,
            };
        }),
    };
};
