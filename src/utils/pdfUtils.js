
export const parsePageRange = (rangeStr, totalPages) => {
    let indices = [];
    if (!rangeStr || rangeStr.trim() === '') {
        // Default: all pages 0 to totalPages-1
        indices = Array.from({ length: totalPages }, (_, i) => i);
    } else {
        const parts = rangeStr.split(',').map(p => p.trim());
        for (const part of parts) {
            if (part === '') continue;

            if (part.includes('-')) {
                const [start, end] = part.split('-').map(n => parseInt(n));
                if (!isNaN(start) && !isNaN(end)) {
                    // Convert 1-based to 0-based
                    // Ensure within bounds? Logic in App.jsx just clamped.
                    // App.jsx logic:
                    // const s = Math.max(0, start - 1);
                    // const e = Math.min(pageCount - 1, end - 1);
                    // for (let i = s; i <= e; i++) ...

                    const s = Math.max(0, start - 1);
                    const e = Math.min(totalPages - 1, end - 1);

                    // Handle reverse range? 5-1? App.jsx loop `i <= e` implies strict distinct order or just forward?
                    // If start > end, standard loop won't run. User might expect reverse? 
                    // Current App.jsx logic: for (let i = s; i <= e; i++)
                    // If start=5, end=1 -> s=4, e=0. Loop doesn't run.
                    // We will stick to current behavior unless "reorder" implies support for 5-1.
                    // But 5-1 is better handled by explicit list "5, 4, 3, 2, 1" for now.

                    for (let i = s; i <= e; i++) {
                        if (!indices.includes(i)) indices.push(i);
                    }
                }
            } else {
                const page = parseInt(part);
                if (!isNaN(page)) {
                    const p = page - 1;
                    if (p >= 0 && p < totalPages && !indices.includes(p)) {
                        indices.push(p);
                    }
                }
            }
        }
    }
    return indices;
};

// Helper to format a list of pages back to a string
// e.g. [0, 2, 3] -> "1, 3, 4"
export const formatPageList = (indices) => {
    return indices.map(i => i + 1).join(', ');
};
