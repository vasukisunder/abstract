import { createMondrian } from './sketches/mondrian.js';
import { createKusama } from './sketches/kusama.js';

let currentSketch = null;
let currentPieceIndex = 0;

const pieces = [
    {
        id: 1,
        title: "Piece 1",
        originalImage: "assets/mondrian1.jpg",
        description: "Description of piece 1...",
        createSketch: () => {
            return new p5((p) => createMondrian(p), 'sketch-holder');
        }
    },
    {
        id: 2,
        title: "Piece 2",
        originalImage: "assets/kusama1.jpg",
        description: "A field of pulsing circles that respond to mouse movement, creating an organic, breathing pattern of light against darkness.",
        createSketch: () => {
            return new p5((p) => createKusama(p), 'sketch-holder');
        }
    },
    {
        id: 3,
        title: "Rothko",
        originalImage: "assets/rothko.webp",
        description: "A Rothko-inspired interpretation exploring color field painting and the emotional resonance of abstract forms.",
        createSketch: () => {
            return new p5((p) => p.setup = () => p.createCanvas(500, 500), 'sketch-holder');
        }
    },
    {
        id: 4,
        title: "Kusama II",
        originalImage: "assets/kusama2.jpg",
        description: "A second exploration of Kusama's distinctive style, focusing on pattern and repetition.",
        createSketch: () => {
            return new p5((p) => p.setup = () => p.createCanvas(500, 500), 'sketch-holder');
        }
    },
    {
        id: 5,
        title: "Martin - Night Sea",
        originalImage: "assets/martin-nightsea.jpg",
        description: "An interpretation of Agnes Martin's 'Night Sea', exploring subtle gradients and geometric patterns.",
        createSketch: () => {
            return new p5((p) => p.setup = () => p.createCanvas(500, 500), 'sketch-holder');
        }
    },
    {
        id: 6,
        title: "Mondrian II",
        originalImage: "assets/mondrian2.jpg",
        description: "A second interpretation of Mondrian's neoplastic style, focusing on dynamic composition and color balance.",
        createSketch: () => {
            return new p5((p) => p.setup = () => p.createCanvas(500, 500), 'sketch-holder');
        }
    },
    {
        id: 7,
        title: "Soulages",
        originalImage: "assets/soulages.webp",
        description: "An interpretation of Pierre Soulages' 'Outrenoir' style, exploring the interplay of light and texture in monochromatic composition.",
        createSketch: () => {
            return new p5((p) => p.setup = () => p.createCanvas(500, 500), 'sketch-holder');
        }
    }
];

// Modal functionality
const modal = document.getElementById('gallery-modal');
const modalOriginal = document.getElementById('modal-original');
const modalDescription = document.getElementById('description');
const closeButton = document.querySelector('.modal-close');
const prevButton = document.querySelector('.modal-nav.prev');
const nextButton = document.querySelector('.modal-nav.next');

function openModal(pieceIndex) {
    currentPieceIndex = pieceIndex;
    const piece = pieces[pieceIndex];
    
    // Update modal content
    modalOriginal.src = piece.originalImage;
    modalDescription.textContent = piece.description;
    
    // Create new sketch
    if (currentSketch) {
        currentSketch.remove();
    }
    currentSketch = piece.createSketch();
    
    // Show modal
    modal.classList.add('active');
}

function closeModal() {
    // Clean up sketch
    if (currentSketch) {
        currentSketch.remove();
        currentSketch = null;
    }
    
    // Hide modal
    modal.classList.remove('active');
}

function showPrevious() {
    if (currentPieceIndex > 0) {
        openModal(currentPieceIndex - 1);
    }
}

function showNext() {
    if (currentPieceIndex < pieces.length - 1) {
        openModal(currentPieceIndex + 1);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.grid-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            openModal(index);
        });
    });

    document.querySelectorAll('.view-button').forEach((button, index) => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(index);
        });
    });
});

closeButton.addEventListener('click', closeModal);
prevButton.addEventListener('click', showPrevious);
nextButton.addEventListener('click', showNext);

// Close modal when clicking outside content
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    
    switch (e.key) {
        case 'Escape':
            closeModal();
            break;
        case 'ArrowLeft':
            showPrevious();
            break;
        case 'ArrowRight':
            showNext();
            break;
    }
}); 