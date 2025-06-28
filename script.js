document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const visualizeBtn = document.getElementById('visualize-btn');
    const seekSequenceDiv = document.getElementById('seek-sequence');
    const totalSeekDiv = document.getElementById('total-seek');
    const avgSeekDiv = document.getElementById('avg-seek');
    let seekChart = null;

    // Initialize with default values
    visualize();

    // Event listener for visualize button
    visualizeBtn.addEventListener('click', visualize);

    function visualize() {
        // Get input values
        const requestsInput = document.getElementById('requests').value;
        const headPosition = parseInt(document.getElementById('head').value);
        const direction = document.getElementById('direction').value;
        const algorithm = document.getElementById('algorithm').value;
        const maxTrack = parseInt(document.getElementById('max-track').value);
        
        // Parse requests
        const requests = requestsInput.split(',')
            .map(req => parseInt(req.trim()))
            .filter(req => !isNaN(req));
        
        if (requests.length === 0) {
            alert('Please enter valid disk requests');
            return;
        }
        
        if (isNaN(headPosition)) {
            alert('Please enter valid initial head position');
            return;
        }
        
        if (isNaN(maxTrack)) {
            alert('Please enter valid max track number');
            return;
        }
        
        // Calculate based on selected algorithm
        let result;
        switch (algorithm) {
            case 'fcfs':
                result = fcfs(requests, headPosition);
                break;
            case 'sstf':
                result = sstf(requests, headPosition);
                break;
            case 'scan':
                result = scan(requests, headPosition, direction, maxTrack);
                break;
            case 'look':
                result = look(requests, headPosition, direction);
                break;
            case 'cscan':
                result = cscan(requests, headPosition, direction, maxTrack);
                break;
            case 'clook':
                result = clook(requests, headPosition, direction);
                break;
            default:
                result = fcfs(requests, headPosition);
        }
        
        // Display results
        displayResults(result, algorithm);
    }
    
    // Algorithm implementations
    function fcfs(requests, head) {
        const sequence = [head, ...requests];
        const seekOperations = calculateSeekOperations(sequence);
        return {
            sequence,
            totalSeek: seekOperations.total,
            averageSeek: seekOperations.average
        };
    }
    
    function sstf(requests, head) {
        let sequence = [head];
        let remainingRequests = [...requests];
        
        while (remainingRequests.length > 0) {
            // Find request with shortest seek time
            let minSeek = Infinity;
            let nextIndex = -1;
            
            for (let i = 0; i < remainingRequests.length; i++) {
                const seek = Math.abs(sequence[sequence.length - 1] - remainingRequests[i]);
                if (seek < minSeek) {
                    minSeek = seek;
                    nextIndex = i;
                }
            }
            
            sequence.push(remainingRequests[nextIndex]);
            remainingRequests.splice(nextIndex, 1);
        }
        
        const seekOperations = calculateSeekOperations(sequence);
        return {
            sequence,
            totalSeek: seekOperations.total,
            averageSeek: seekOperations.average
        };
    }
    
    function scan(requests, head, direction, maxTrack) {
        let sequence = [head];
        let remainingRequests = [...requests];
        
        if (direction === 'left') {
            // Add all requests less than current head
            const leftRequests = remainingRequests.filter(req => req <= head);
            leftRequests.sort((a, b) => b - a); // descending
            
            sequence.push(...leftRequests);
            
            // Go to 0 if there are requests there
            if (leftRequests.length > 0 && leftRequests[leftRequests.length - 1] !== 0) {
                sequence.push(0);
            }
            
            // Now go right
            const rightRequests = remainingRequests.filter(req => req > head);
            rightRequests.sort((a, b) => a - b); // ascending
            
            sequence.push(...rightRequests);
        } else {
            // Add all requests greater than current head
            const rightRequests = remainingRequests.filter(req => req >= head);
            rightRequests.sort((a, b) => a - b); // ascending
            
            sequence.push(...rightRequests);
            
            // Go to max track if there are requests there
            if (rightRequests.length > 0 && rightRequests[rightRequests.length - 1] !== maxTrack) {
                sequence.push(maxTrack);
            }
            
            // Now go left
            const leftRequests = remainingRequests.filter(req => req < head);
            leftRequests.sort((a, b) => b - a); // descending
            
            sequence.push(...leftRequests);
        }
        
        const seekOperations = calculateSeekOperations(sequence);
        return {
            sequence,
            totalSeek: seekOperations.total,
            averageSeek: seekOperations.average
        };
    }
    
    function look(requests, head, direction) {
        let sequence = [head];
        let remainingRequests = [...requests];
        
        if (direction === 'left') {
            // Add all requests less than current head
            const leftRequests = remainingRequests.filter(req => req <= head);
            leftRequests.sort((a, b) => b - a); // descending
            
            sequence.push(...leftRequests);
            
            // Now go right
            const rightRequests = remainingRequests.filter(req => req > head);
            rightRequests.sort((a, b) => a - b); // ascending
            
            sequence.push(...rightRequests);
        } else {
            // Add all requests greater than current head
            const rightRequests = remainingRequests.filter(req => req >= head);
            rightRequests.sort((a, b) => a - b); // ascending
            
            sequence.push(...rightRequests);
            
            // Now go left
            const leftRequests = remainingRequests.filter(req => req < head);
            leftRequests.sort((a, b) => b - a); // descending
            
            sequence.push(...leftRequests);
        }
        
        const seekOperations = calculateSeekOperations(sequence);
        return {
            sequence,
            totalSeek: seekOperations.total,
            averageSeek: seekOperations.average
        };
    }
    
    function cscan(requests, head, direction, maxTrack) {
        let sequence = [head];
        let remainingRequests = [...requests];
        
        if (direction === 'left') {
            // Add all requests less than current head
            const leftRequests = remainingRequests.filter(req => req <= head);
            leftRequests.sort((a, b) => b - a); // descending
            
            sequence.push(...leftRequests);
            
            // Jump to max track and continue left
            sequence.push(maxTrack);
            sequence.push(0);
            
            // Add remaining requests (those greater than head)
            const rightRequests = remainingRequests.filter(req => req > head);
            rightRequests.sort((a, b) => b - a); // descending
            
            sequence.push(...rightRequests);
        } else {
            // Add all requests greater than current head
            const rightRequests = remainingRequests.filter(req => req >= head);
            rightRequests.sort((a, b) => a - b); // ascending
            
            sequence.push(...rightRequests);
            
            // Jump to 0 and continue right
            sequence.push(0);
            sequence.push(maxTrack);
            
            // Add remaining requests (those less than head)
            const leftRequests = remainingRequests.filter(req => req < head);
            leftRequests.sort((a, b) => a - b); // ascending
            
            sequence.push(...leftRequests);
        }
        
        const seekOperations = calculateSeekOperations(sequence);
        return {
            sequence,
            totalSeek: seekOperations.total,
            averageSeek: seekOperations.average
        };
    }
    
    function clook(requests, head, direction) {
        let sequence = [head];
        let remainingRequests = [...requests];
        
        if (direction === 'left') {
            // Add all requests less than current head
            const leftRequests = remainingRequests.filter(req => req <= head);
            leftRequests.sort((a, b) => b - a); // descending
            
            sequence.push(...leftRequests);
            
            // Jump to highest remaining request and continue left
            const highestRequest = Math.max(...remainingRequests.filter(req => req > head));
            sequence.push(highestRequest);
            
            // Add remaining requests (those greater than head)
            const rightRequests = remainingRequests.filter(req => req > head && req < highestRequest);
            rightRequests.sort((a, b) => b - a); // descending
            
            sequence.push(...rightRequests);
        } else {
            // Add all requests greater than current head
            const rightRequests = remainingRequests.filter(req => req >= head);
            rightRequests.sort((a, b) => a - b); // ascending
            
            sequence.push(...rightRequests);
            
            // Jump to lowest remaining request and continue right
            const lowestRequest = Math.min(...remainingRequests.filter(req => req < head));
            sequence.push(lowestRequest);
            
            // Add remaining requests (those less than head)
            const leftRequests = remainingRequests.filter(req => req < head && req > lowestRequest);
            leftRequests.sort((a, b) => a - b); // ascending
            
            sequence.push(...leftRequests);
        }
        
        const seekOperations = calculateSeekOperations(sequence);
        return {
            sequence,
            totalSeek: seekOperations.total,
            averageSeek: seekOperations.average
        };
    }
    
    function calculateSeekOperations(sequence) {
        let total = 0;
        for (let i = 1; i < sequence.length; i++) {
            total += Math.abs(sequence[i] - sequence[i - 1]);
        }
        return {
            total,
            average: total / (sequence.length - 1)
        };
    }
    
    function displayResults(result, algorithm) {
        // Display text results
        seekSequenceDiv.innerHTML = `<strong>Seek Sequence:</strong> ${result.sequence.join(' → ')}`;
        totalSeekDiv.innerHTML = `<strong>Total Seek Time:</strong> ${result.totalSeek}`;
        avgSeekDiv.innerHTML = `<strong>Average Seek Time:</strong> ${result.averageSeek.toFixed(2)}`;
        
        // Create chart
        const ctx = document.getElementById('seekChart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (seekChart) {
            seekChart.destroy();
        }
        
        // Prepare data for chart
        const labels = result.sequence.map((_, index) => `Step ${index}`);
        const dataPoints = result.sequence;
        
        // Calculate seek distances for coloring
        const seekDistances = [];
        for (let i = 1; i < result.sequence.length; i++) {
            seekDistances.push(Math.abs(result.sequence[i] - result.sequence[i - 1]));
        }
        
        // Create background colors based on seek distance
        const backgroundColors = ['rgba(75, 192, 192, 0.2)'];
        const borderColors = ['rgba(75, 192, 192, 1)'];
        
        for (let i = 0; i < seekDistances.length; i++) {
            // Longer seeks get more red, shorter seeks get more green
            const ratio = Math.min(seekDistances[i] / 100, 1);
            const red = Math.floor(255 * ratio);
            const green = Math.floor(255 * (1 - ratio));
            backgroundColors.push(`rgba(${red}, ${green}, 0, 0.2)`);
            borderColors.push(`rgba(${red}, ${green}, 0, 1)`);
        }
        
        seekChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Head Position',
                    data: dataPoints,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    tension: 0.1,
                    pointBackgroundColor: borderColors,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Track Number'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Seek Steps'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `${algorithm.toUpperCase()} Seek Pattern`,
                        font: {
                            size: 18
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.dataIndex === 0) {
                                    return `Start: ${context.parsed.y}`;
                                } else {
                                    const seek = Math.abs(
                                        context.dataset.data[context.dataIndex] - 
                                        context.dataset.data[context.dataIndex - 1]
                                    );
                                    return `Track: ${context.parsed.y} | Seek: ${seek}`;
                                }
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                animation: {
                    duration: 2000
                }
            }
        });
    }
});