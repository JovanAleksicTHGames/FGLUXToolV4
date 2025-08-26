// Declare miro global for safety
/* global miro */

// Extract numeric values from selected sticky notes
async function getStickyValues() {
  const widgets = await miro.board.selection.get();
  const values = [];

  for (const widget of widgets) {
    if (widget.type === 'sticky_note') {
      const num = parseFloat(widget.content?.plainText || '');
      if (!isNaN(num)) {
        values.push({ id: widget.id, value: num });
      }
    }
  }

  return values;
}

// Create a new sticky note with given content
async function createSticky(text) {
  return await miro.board.createStickyNote({
    content: text,
    style: 'yellow',
    shape: 'square',
  });
}

// Set up dynamic sync for sum or product
async function setupSync(operation) {
  const stickies = await getStickyValues();
  if (stickies.length === 0) {
    alert('Select at least one sticky note with a number.');
    return;
  }

  const calc = () => {
    const nums = stickies.map(s => s.value);
    return operation === 'sum'
      ? nums.reduce((a, b) => a + b, 0)
      : nums.reduce((a, b) => a * b, 1);
  };

  const resultSticky = await createSticky(`${operation.toUpperCase()}: ${calc()}`);

  // Watch for updates to original sticky notes
  miro.board.ui.on('widget:update', async (event) => {
    let updated = false;

    for (const widget of event.widgets) {
      const match = stickies.find(s => s.id === widget.id);
      if (match) {
        const newVal = parseFloat(widget.content?.plainText || '');
        if (!isNaN(newVal) && newVal !== match.value) {
          match.value = newVal;
          updated = true;
        }
      }
    }

    if (updated) {
      await miro.board.widgets.update({
        id: resultSticky.id,
        content: `${operation.toUpperCase()}: ${calc()}`
      });
    }
  });
}

// Button event listeners
document.getElementById('sum').onclick = () => setupSync('sum');
document.getElementById('product').onclick = () => setupSync('product');

// Handle app icon click inside Miro
miro.board.ui.on('icon:click', async () => {
  await miro.board.ui.openPanel({ url: 'index.html' });
});
