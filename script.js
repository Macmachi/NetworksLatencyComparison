// Rymentz
// MIT License

const HOURS_24 = 24 * 60 * 60 * 1000;
let simulationSpeed = 1000; 
let startTime = Date.now();
let isRunning = true;

const networks = [
    { 
        name: 'Kaspa Testnet', 
        type: 'BlockDAG (PoW)',
        latency: 100, 
        class: 'kaspa-test',
        ratings: {
            scalability: 3,
            security: 3,
            decentralization: 3
        }
    },
    { 
        name: 'Solana', 
        type: 'Blockchain (PoS)',
        latency: 400, 
        class: 'solana',
        ratings: {
            scalability: 3,
            security: 2,
            decentralization: 2
        }
    },
    { 
        name: 'Kaspa Mainnet', 
        type: 'BlockDAG (PoW)',
        latency: 1000, 
        class: 'kaspa-main',
        ratings: {
            scalability: 2,
            security: 3,
            decentralization: 3
        }
    },
    { 
        name: 'Avalanche', 
        type: 'DAG (PoS)',
        latency: 2000, 
        class: 'avalanche',
        ratings: {
            scalability: 2,
            security: 3,
            decentralization: 2
        }
    },
    { 
        name: 'Ethereum', 
        type: 'Blockchain (PoS)',
        latency: 12000, 
        class: 'ethereum',
        ratings: {
            scalability: 1,
            security: 3,
            decentralization: 3
        }
    },
    { 
        name: 'Bitcoin', 
        type: 'Blockchain (PoW)',
        latency: 600000, 
        class: 'bitcoin',
        ratings: {
            scalability: 1,
            security: 3,
            decentralization: 3
        }
    }
].sort((a, b) => a.latency - b.latency);

const maxBlocksPerDay = Math.floor(HOURS_24 / 100);

function getRatingStars(rating) {
    const stars = '⭐'.repeat(rating);
    const emptyStars = '☆'.repeat(3 - rating);
    return stars + emptyStars;
}

function getLatencyColorClass(ms) {
    if (ms > 1000) return 'text-red-500';
    if (ms === 1000) return 'text-orange-500';
    return 'text-green-500';
}

function getTrilemmaRatings(ratings) {
    return `
        <div class="rating-group">
            <div class="rating-label">Scalability:</div>
            <div class="rating-stars">${getRatingStars(ratings.scalability)}</div>
        </div>
        <div class="rating-group">
            <div class="rating-label">Security:</div>
            <div class="rating-stars">${getRatingStars(ratings.security)}</div>
        </div>
        <div class="rating-group">
            <div class="rating-label">Decentralization:</div>
            <div class="rating-stars">${getRatingStars(ratings.decentralization)}</div>
        </div>
    `;
}

const networksContainer = document.querySelector('.networks');
networks.forEach((network, index) => {
    const networkDiv = document.createElement('div');
    networkDiv.className = 'network-wrapper';
    networkDiv.innerHTML = `
        <div class="network-info">
            <div class="network-header">
                <span class="network-name">${network.name}</span>
                <span class="network-type text-sm text-gray-400">${network.type}</span>
            </div>
            <div class="trilemma-ratings">
                ${getTrilemmaRatings(network.ratings)}
            </div>
            <span class="latency ${getLatencyColorClass(network.latency)}">
                Latency : ${formatLatency(network.latency)}
            </span>
        </div>
        ${network.hideProgress ? '' : `
            <div class="network ${network.class}">
                <div class="progress-bar"></div>
                <div class="stats-overlay">
                    <div class="current-status">${network.name}</div>
                    <div class="blocks-stats">
                        ${network.type === 'Payment Network' ? 'Transactions' : 'Blocks'}: <span class="block-count">0</span>
                    </div>
                </div>
            </div>
        `}
    `;
    networksContainer.appendChild(networkDiv);
});

function formatLatency(ms) {
    if (ms >= 60000) return `${ms/60000} minutes`;
    if (ms >= 1000) return `${(ms/1000).toFixed(1)} seconds`;
    return `${ms} ms`;
}

function formatTime(ms) {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
}

function adjustSpeed(factor) {
    const currentTime = Date.now();
    const elapsedRealTime = currentTime - startTime;
    const elapsedSimulatedTime = elapsedRealTime * simulationSpeed;
    
    simulationSpeed *= factor;
    document.getElementById('speedDisplay').textContent = simulationSpeed + 'x';
    
    startTime = currentTime - (elapsedSimulatedTime / simulationSpeed);
}

function resetSimulation() {
    startTime = Date.now();
    networks.forEach(network => {
        const blockCount = document.querySelector(`.${network.class} .block-count`);
        if (blockCount) {
            blockCount.textContent = '0';
        }
        
        if (!network.hideProgress) {
            const progressBar = document.querySelector(`.${network.class} .progress-bar`);
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        }
    });
}

function updateSimulation() {
    const currentTime = Date.now();
    const elapsedRealTime = currentTime - startTime;
    const elapsedSimulatedTime = elapsedRealTime * simulationSpeed;

    document.getElementById('timeElapsed').textContent = 
        formatTime(Math.min(elapsedSimulatedTime, HOURS_24));

    networks.forEach(network => {
        const currentBlocks = Math.floor(elapsedSimulatedTime / network.latency);
        const progress = (currentBlocks / maxBlocksPerDay) * 100;

        const blockCount = document.querySelector(`.${network.class} .block-count`);
        if (blockCount) {
            blockCount.textContent = currentBlocks.toLocaleString();
        }

        // Ne met à jour la progress bar que si elle existe
        if (!network.hideProgress) {
            const progressBar = document.querySelector(`.${network.class} .progress-bar`);
            if (progressBar) {
                progressBar.style.width = `${Math.min(progress, 100)}%`;
            }
        }
    });

    if (elapsedSimulatedTime < HOURS_24 && isRunning) {
        requestAnimationFrame(updateSimulation);
    }
}

updateSimulation();