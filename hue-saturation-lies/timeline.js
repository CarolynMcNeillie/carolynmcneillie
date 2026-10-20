import { SLIDES } from './slides.js';
import { TIMELINE_START, TIMELINE_END } from './slide-library.js';

const timelineContent = document.querySelector('#timeline-content');
const timelineRow = document.querySelector('#timeline-row');
const PRESENT = 2026;
const timelineStartIndex = Math.max(0, SLIDES.findIndex(({ id }) => id === TIMELINE_START));
const timelineEndIndex = SLIDES.findIndex(({ id }) => id === TIMELINE_END);
const rangeSlides = SLIDES.slice(timelineStartIndex, timelineEndIndex + 1);
const datedItems = rangeSlides.flatMap(({ slide }) =>
  (slide.backgrounds ?? [slide]).map((entry) => entry.timeline ?? slide.timeline),
);
// A date is a point `{ year }` or a range `{ year, end }` (BCE negative).
const dateKey = (date) => `${date.year}:${date.end ?? ""}`;
const marks = [...new Map(datedItems
  .filter((date) => date && Number.isFinite(date.year) && date.year <= PRESENT)
  .map((date) => [dateKey(date), date])).values()];
const markKeys = new Set(marks.map(dateKey));
const earliest = Math.min(...marks.map((date) => date.year));
// Logarithmic age: T = PRESENT - year + 1; x = 1 - ln(T) / ln(T(earliest)).
function timelineX(year) {
  return 1 - Math.log(PRESENT - year + 1) / Math.log(PRESENT - earliest + 1);
}
function previousDate(slideIndex, bgIndex) {
  for (let i = slideIndex; i >= timelineStartIndex; i--) {
    const slide = SLIDES[i].slide;
    const entries = slide.backgrounds ?? [slide];
    for (let j = (i === slideIndex ? bgIndex : entries.length - 1); j >= 0; j--) {
      const date = entries[j].timeline ?? slide.timeline;
      if (date && markKeys.has(dateKey(date))) return date;
    }
  }
  return null;
}
let currentState = { slideIndex: 0, bgIndex: 0, attribution: undefined };
// Called with no argument (on resize), it redraws the last slide it was given.
export function renderTimeline(state = currentState) {
  currentState = state;
  const { slideIndex, bgIndex, credit } = state;
  const attribution = state.attribution ?? (credit ? { text: credit } : null);
  timelineContent.replaceChildren();
  timelineRow.replaceChildren();
  const inRange = timelineEndIndex >= 0
    && slideIndex >= timelineStartIndex && slideIndex <= timelineEndIndex;
  document.body.classList.toggle("has-timeline", inRange);
  if (inRange) {
    const track = document.createElement("div");
    track.className = "timeline-track";
    timelineRow.append(track);
    const date = previousDate(slideIndex, bgIndex);
    const yearText = (year) => (year < 0 ? `${Math.abs(year).toLocaleString()} BCE` : String(year));
    // Draw order: the current period's bar first, then every dot on top.
    const isCurrent = (mark) => !!date && dateKey(mark) === dateKey(date);
    const layer = (mark) => (mark.end != null && isCurrent(mark) ? 0 : 1);
    for (const mark of [...marks].sort((a, b) => layer(a) - layer(b))) {
      const current = isCurrent(mark) ? " current" : "";
      const el = document.createElement("span");
      if (mark.end != null && !current) {
        // An inactive period is a plain dot at its midpoint (where its label sits).
        el.className = "timeline-dot";
        el.style.left = `${((timelineX(mark.year) + timelineX(mark.end)) / 2) * 100}%`;
        el.title = mark.label ?? `${yearText(mark.year)}–${yearText(mark.end)}`;
      } else if (mark.end != null) {
        el.className = `timeline-range${current}`;
        el.style.left = `${timelineX(mark.year) * 100}%`;
        el.style.width = `${(timelineX(mark.end) - timelineX(mark.year)) * 100}%`;
        el.title = mark.label ?? `${yearText(mark.year)}–${yearText(mark.end)}`;
      } else {
        el.className = `timeline-dot${current}`;
        el.style.left = `${timelineX(mark.year) * 100}%`;
        el.title = mark.label ?? yearText(mark.year);
      }
      track.append(el);
    }
    if (date) {
      const label = document.createElement("span");
      label.className = "timeline-label";
      label.textContent = date.label ?? (date.end != null ? `${yearText(date.year)}–${yearText(date.end)}` : yearText(date.year));
      label.title = label.textContent;
      // Centred over its dot or range (a percentage, like the marks), then
      // nudged inward after layout so it never runs past either end of the line.
      const pct = (date.end != null ? (timelineX(date.year) + timelineX(date.end)) / 2 : timelineX(date.year)) * 100;
      label.style.left = `${pct}%`;
      label.style.transform = "translateX(-50%)";
      track.append(label);
      requestAnimationFrame(() => {
        const t = track.getBoundingClientRect();
        const l = label.getBoundingClientRect();
        const shift = l.left < t.left ? t.left - l.left : l.right > t.right ? t.right - l.right : 0;
        if (shift) label.style.transform = `translateX(calc(-50% + ${shift}px))`;
      });
    }
  }
  if (attribution) {
    const credit = document.createElement(attribution.url ? "a" : "span");
    credit.className = "timeline-credit";
    // _Title_ marks a work's title, set in italics. Text nodes, never HTML.
    attribution.text.split(/_(.+?)_/).forEach((part, i) => {
      if (!part) return;
      if (i % 2) credit.append(Object.assign(document.createElement("em"), { textContent: part }));
      else credit.append(part);
    });
    credit.title = attribution.text.replace(/_(.+?)_/g, "$1");
    if (attribution.url) {
      credit.href = attribution.url;
      credit.target = "_blank";
      credit.rel = "noopener";
    }
    timelineContent.append(credit);
  }
}
window.addEventListener("resize", () => renderTimeline());
