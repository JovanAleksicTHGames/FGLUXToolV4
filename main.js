// Miro Sticky Note Calculator - Main JavaScript
// This handles the icon click event and panel functionality

// Icon click handler - required for app to show up in toolbar
miro.board.ui.on('icon:click', async () => {
    await miro.board.ui.openPanel({
        url: 'https://fglux-tool-v4.vercel.app/'
    });
});

// Wait for DOM to be ready before accessing elements
document.addEventListener('DOMContentLoaded', function() {
    init();
});

// Main app functionality
async function init() {
    await miro.ready();
    
    // Only initialize UI if we're in the panel context
    if (window.location.search.includes('panel=1') || window.parent !== window) {
        setupUI();
    }
}

function setupUI() {
    // Check if elements exist before setting up event listeners
    const sumBtn = document.getElementById('sumBtn');
    const productBtn = document.getElementById('productBtn');
    
    if (sumBtn) {
        sumBtn.addEventListener('click', createSum);
    }
    if (productBtn) {
        productBtn.addEventListener('click', createProduct);
    }
    
    // Listen for selection changes
    miro.board.ui.on('selection:update', updateUI);
    
    // Initial UI update
    updateUI();
}

async function createSum() {
    const selection = await miro.board.ui.getSelection();
    const numbers = getNumericValues(selection);
    
    if (numbers.length >= 2) {
        const sum = numbers.reduce((a, b) => a + b, 0);
        await miro.board.createStickyNote({
            content: sum.toString(),
            style: { fillColor: 'light_yellow' }
        });
        showStatus('Sum created!');
    } else {
        showStatus('Please select at least 2 sticky notes with numbers');
    }
}

async function createProduct() {
    const selection = await miro.board.ui.getSelection();
    const numbers = getNumericValues(selection);
    
    if (numbers.length >= 2) {
        const product = numbers.reduce((a, b) => a * b, 1);
        await miro.board.createStickyNote({
            content: product.toString(),
            style: { fillColor: 'light_green' }
        });
        showStatus('Product created!');
    } else {
        showStatus('Please select at least 2 sticky notes with numbers');
    }
}

function getNumericValues(selection) {
    return selection
        .filter(item => item.type === 'sticky_note')
        .map(item => parseFloat(item.content))
        .filter(n => !isNaN(n));
}

async function updateUI() {
    const selection = await miro.board.ui.getSelection();
    const numbers = getNumericValues(selection);
    const hasEnough = numbers.length >= 2;
    
    const sumBtn = document.getElementById('sumBtn');
    const productBtn = document.getElementById('productBtn');
    const selectionInfo = document.getElementById('selectionInfo');
    
    if (sumBtn) sumBtn.disabled = !hasEnough;
    if (productBtn) productBtn.disabled = !hasEnough;
    if (selectionInfo) {
        selectionInfo.textContent = hasEnough 
            ? `${numbers.length} numbers selected` 
            : 'Select 2 or more sticky notes with numbers';
    }
}

function showStatus(message) {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.display = 'block';
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);
    }
}
