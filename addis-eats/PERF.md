# Addis Eats — Performance Report

## Test conditions

* **Tool:** Chrome Lighthouse
* **Mode:** Mobile
* **Environment:** Production build (`npm run build` and `npm run start`)
* **Network:** Slow 4G
* **CPU:** 4× slowdown

## Before and after results

| Metric                 | Day 42 — Before | Day 43 — After |                Difference |
| ---------------------- | --------------: | -------------: | ------------------------: |
| Lighthouse Performance |              80 |             88 |                 +8 points |
| LCP                    |           1.8 s |          1.7 s |              0.1 s faster |
| CLS                    |               0 |              0 |                 No change |
| TBT                    |          870 ms |         440 ms |              430 ms lower |
| Page weight            |            1 MB |         745 kB | Approximately 255 kB less |

## Decision 3 — the performance budget

"Before" is the Day 42 measurement and "After" the Day 43 one, both from the table above (same conditions). A cell that says *not recorded* has no number yet; the command that produces it is in the last column. Nothing here is estimated.

| Measure | Target | Before | After | Met? | How to record it |
|---|---|---|---|---|---|
| LCP, throttled | Under 2.5 s | 1.8 s | 1.7 s | Yes | Lighthouse, mobile, Slow 4G, 4× CPU, on the deployed build |
| CLS | Under 0.1 | 0 | 0 | Yes | Same Lighthouse run |
| First Load JS, `/menu` | Under 120 kB | not recorded | not recorded | — | `npm run build`, the `/menu` row of the route table (First Load JS) |
| Largest image | Under 150 kB | not recorded | not recorded | — | DevTools → Network → Img, sort by Size, on `/menu` and `/` (the transferred AVIF/WebP, not the file in `public/`) |
| Lighthouse performance | 90 or better | 80 | 88 | **No, 2 points short** | Same Lighthouse run |

**The number that did not reach target: 88 instead of 90.** What the measurements say: LCP and CLS are already inside budget, and TBT is the one other metric recorded (440 ms after, 870 ms before), so it is the most likely thing still holding the score back. FCP and Speed Index were not recorded, so they are not ruled out. What is still a hypothesis, to be confirmed in the Lighthouse trace ("Reduce unused JavaScript" and "Minimize main-thread work"): the `/menu` route ships client code for the menu layout, SWR, the cart provider and the explorer, and the header adds `AuthNav` and `CartHeader`. Do not write a cause here until the trace names one.

**Day 45 code change to re-measure.** The menu's server seed used to hold all 25 dishes while the API answered with 6 per page, so on arrival the list showed 25 cards and then collapsed to 6 when SWR revalidated. It now seeds exactly the API's answer for the current category and page (`lib/menuQuery.js`). Run Lighthouse once more on the deployed build and add a "Day 45" column; expect CLS to stay at 0.

## Changes made

* Optimized images with `next/image`, dimensions, and `sizes`.
* Used `priority` on the main above-the-fold image.
* Configured local font loading with `next/font`.
* Improved environment configuration.

## Analysis

The Lighthouse Performance score increased from 80 to 88, an improvement of 8 points. LCP improved from 1.8 seconds to 1.7 seconds, while CLS remained at 0, indicating that layout stability was maintained.

The most significant measured improvement was Total Blocking Time (TBT), which decreased from 870 ms to 440 ms, a reduction of 430 ms. Page weight also decreased from 1 MB to 745 kB, reducing the amount of data transferred.

The results suggest that the optimizations reduced browser workload and page weight. However, further investigation may be needed to identify exactly which individual change contributed most to the TBT improvement.

## Conclusion

The Day 43 optimizations improved the Lighthouse Performance score from 80 to 88 and reduced both Total Blocking Time and page weight. LCP improved slightly, and CLS remained at zero. These results indicate better overall performance while maintaining layout stability.
