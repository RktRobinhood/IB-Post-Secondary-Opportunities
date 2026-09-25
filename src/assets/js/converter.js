/* IB points -> Danish grade average, plus a rough sense of what that average
   opens. The table is emitted into the page by the build, so this file never
   goes out of date on its own. */

const data = JSON.parse(document.getElementById('conversion-data').textContent);
const input = document.getElementById('ib-points');
const out = document.getElementById('conv-out');

function danishAverage(points) {
  const row = data.average.find((r) => r.ib === points);
  return row ? row.dk : null;
}

/* Rough orientation only — real cut-offs are published on 28 July each year and
   move annually. Deliberately vague, because a precise-sounding claim here
   would be a false one. */
function sense(dk) {
  if (dk === null) return '';
  if (dk >= 11) return 'Above the published cut-off for essentially every Danish programme in recent years.';
  if (dk >= 9.5) return 'Competitive for the most selective Danish programmes.';
  if (dk >= 8) return 'Comfortable for most programmes with restricted admission.';
  if (dk >= 6) return 'Clears the GPA floors that Copenhagen and several Aarhus programmes apply.';
  if (dk >= 4.4) return 'Qualifies for admission; competitive programmes will be a stretch in quota 1.';
  return 'Below the level at which an IB Diploma is normally awarded.';
}

function render() {
  const points = Number(input.value);
  if (!Number.isFinite(points) || points < 18 || points > 45) {
    out.innerHTML = '<span>Enter a total between 18 and 45.</span>';
    return;
  }
  const dk = danishAverage(points);
  if (dk === null) {
    out.innerHTML = '<span>No conversion is published for that total.</span>';
    return;
  }
  out.innerHTML = `
    <span><strong>${points} IB points</strong></span>
    <span aria-hidden="true">→</span>
    <span><strong>${dk.toFixed(1)}</strong> on the Danish 7-point scale</span>
    <span style="flex-basis:100%;color:var(--ink-mute)">${sense(dk)}</span>`;
}

input?.addEventListener('input', render);
render();

/* One subject looked up: the IB course a student takes, the Danish level it
   counts as, and how many programmes on this site ask for that level. Read from
   the handbook's table, emitted by the build beside the grade tables. */
const lookup = data.lookup || [];
const pick = document.getElementById('subject-lookup');
const lookupOut = document.getElementById('lookup-out');

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function renderLookup() {
  const row = lookup[Number(pick.value)];
  if (!pick.value || !row) {
    lookupOut.hidden = true;
    lookupOut.innerHTML = '';
    return;
  }
  lookupOut.hidden = false;
  if (row.verdict) {
    lookupOut.innerHTML = `<span><strong>${esc(row.course)}</strong></span><span aria-hidden="true">→</span><span>${esc(row.verdict)} <a href="#special">The awkward cases</a></span>`;
    return;
  }
  lookupOut.innerHTML = row.levels
    .map(
      (l) => `<span><strong>${esc(row.course)}</strong></span><span aria-hidden="true">→</span>
        <span><strong>${esc(l.level)}</strong> <small lang="da">(${esc(l.local)})</small></span>
        <span style="flex-basis:100%;color:var(--ink-mute)">${
          l.asked ? `Asked for by ${l.asked} programme${l.asked === 1 ? '' : 's'} on this site.` : 'No programme on this site asks for this level.'
        }${l.note ? ` ${esc(l.note)}` : ''}</span>`
    )
    .join('');
}

pick?.addEventListener('change', renderLookup);
if (pick) renderLookup();
