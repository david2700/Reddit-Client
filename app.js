document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    const addLaneButton = document.querySelector('.material-icons-outlined');
    const subredditInput = document.querySelector('#subreddit-input');
    const submitButton = document.querySelector('.submit-button');

    addLaneButton.addEventListener('click', () => {
        const popup = document.querySelector('.popup');
        const currentState = popup.dataset.state;
        console.log(currentState);
        popup.dataset.state = currentState === 'closed' ? 'open' : 'closed';
        popup.scrollIntoView({ behavior: "smooth", inline: "center" });
    });

    function createLane(subreddit, posts) {
        const lane = document.createElement('div');
        lane.className = 'subreddit-lane';
        
        const header = document.createElement('div');
        header.className = 'lane-header';
        
        const title = document.createElement('span');
        title.className = 'subreddit-title';
        title.textContent = `r/${subreddit}`;
        
        const menuButton = document.createElement('i');
        menuButton.className = 'material-icons-outlined';
        menuButton.textContent = 'more_vert';
        
        // Create overlay and menu
        const overlay = document.createElement('div');
        overlay.className = 'lane-overlay';
        
        const menu = document.createElement('div');
        menu.className = 'lane-menu';
        
        const deleteOption = document.createElement('div');
        deleteOption.className = 'lane-menu-item';
        deleteOption.textContent = 'Delete';
        
        const refreshOption = document.createElement('div');
        refreshOption.className = 'lane-menu-item';
        refreshOption.textContent = 'Refresh';
        
        menu.appendChild(deleteOption);
        menu.appendChild(refreshOption);
        
        // Menu button click handler
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isMenuOpen = menu.style.display === 'block';
    
            // Toggle the menu display
            menu.style.display = isMenuOpen ? 'none' : 'block';
            
            // Show or hide the overlay
            overlay.style.display = isMenuOpen ? 'none' : 'block';
        });
        
        // Close menu when clicking overlay
        overlay.addEventListener('click', () => {
            overlay.style.display = 'none';
            menu.style.display = 'none';
        });
        
        // Delete handler
        deleteOption.addEventListener('click', () => {
            lane.remove();
        });
        
        // Refresh handler
        refreshOption.addEventListener('click', () => {
            overlay.style.display = 'none';
            menu.style.display = 'none';
            refreshLane(subreddit, lane);
        });
        
        header.appendChild(title);
        header.appendChild(menuButton);
        
        const postContainer = document.createElement('div');
        postContainer.className = 'post-container';
        
        // Get only the 5 most recent posts
        const recentPosts = posts.data.children.slice(0, 5);
        
        recentPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            
            const votesElement = document.createElement('div');
            votesElement.className = 'post-votes';
            
            const arrow = document.createElement('span');
            arrow.className = 'vote-arrow';
            arrow.textContent = '^';
            
            const score = document.createElement('span');
            score.textContent = post.data.ups;
            
            votesElement.appendChild(arrow);
            votesElement.appendChild(score);
            
            const titleElement = document.createElement('div');
            titleElement.className = 'post-title';
            titleElement.textContent = post.data.title;
            
            postElement.appendChild(votesElement);
            postElement.appendChild(titleElement);
            postContainer.appendChild(postElement);
        });
        
        lane.appendChild(header);
        lane.appendChild(postContainer);
        lane.appendChild(overlay);
        lane.appendChild(menu);
        
        return lane;
    }

    function refreshLane(subreddit, laneElement) {
        fetch(`https://www.reddit.com/r/${subreddit}.json`)
            .then(response => response.json())
            .then(data => {
                const newLane = createLane(subreddit, data);
                laneElement.parentNode.replaceChild(newLane, laneElement);
            })
            .catch(error => {
                console.error('Error refreshing lane:', error);
                alert('Error refreshing lane. Please try again.');
            });
    }

    function addSubreddit(subreddit) {
        const API_URL = `https://www.reddit.com/r/${subreddit}.json`;

        fetch(API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching subreddit');
                }
                return response.json();
            })
            .then(data => {
                const popupContainer = document.querySelector('.add-popup-container');
                const lane = createLane(subreddit, data);
                
                // Insert the new lane before the popup container
                popupContainer.parentNode.insertBefore(lane, popupContainer);
                
                // Close the popup after adding
                const popup = document.querySelector('.popup');
                popup.dataset.state = 'closed';
                
                // Clear the input
                subredditInput.value = '';
                popupContainer.scrollIntoView({ behavior: "smooth", block: "end" });
            })
            .catch(error => {
                console.error(error);
                alert('Error fetching subreddit. Please check the subreddit name and try again.');
            });
    }

    submitButton.addEventListener('click', () => {
        const subreddit = subredditInput.value;
        addSubreddit(subreddit);
    });

}); 