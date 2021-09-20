/*
  script.js

  Author: Brianna Drew
  Date Created: September 15th, 2021
  Last Modified: September 19th, 2021
  Description: This script connects to NASA's APOD (Astronomy Picture of the Day) API and obtains images from July 1st, 2021 to the current date and their relevant information (title, date, and explanation).
               It also gives a like button to each where users can like/unlike each image, which will remain for the duration of the session if unchanged. It then collects this information into HTML elements
               which are then inserted into the DOM and are displayed in a responsive grid through the use of Desandro's Masonry cascading grid layout library.
*/

'use strict';

window.addEventListener('DOMContentLoaded', () => {
  // Like/unlike sound effects
  const like_sound = new Audio('like.wav');
  const unlike_sound = new Audio('unlike.wav');

  // Select grid to contain results from NASA APOD API
  const grid = document.querySelector('.grid');

  // Get today's date
  const today = new Date().toISOString().slice(0, 10)
  
  // URL to access NASA APOD API images from July 1st, 2021 to the current date
  const api = 'https://api.nasa.gov/planetary/apod?api_key=0ewPNR60EVPNK3URxd69bF3pnzdZN98Xrzi1yO0z&start_date=2021-07-01&end_date=' + today;

  // Connect to the NASA APOD API via XMLHttpRequest
  const xhr = new XMLHttpRequest();
  xhr.open('GET', api);
  xhr.send();

  // When the ready state of the XMLHttpRequest changes...
  xhr.onreadystatechange = function() {
    // When the request is completed and a response was received...
    if (xhr.status == 200 && xhr.readyState == 4) {
      // Array to hold results to be added to the grid
      var elems = [];

      // Create fragment to hold the results to be added to the DOM tree
      var fragment = document.createDocumentFragment();

      // Parse response from NASA APOD API from JSON
      var response = JSON.parse(xhr.responseText);

      // Count which item from NASA APOD API we are currently working with
      var counter = 1;

      // For each result from NASA APOD API...
      response.forEach(object => {

        // If this is an image not previously loaded in the current session...
        if (window.sessionStorage.getItem(counter) == null) {
          window.sessionStorage.setItem(counter, 0); // Set session variable to hold like value
        }

        // Create HTML elements for current response then append them to both the fragment and array
        var elem = createElements(object, counter);
        fragment.appendChild(elem);
        elems.push(elem);

        // Continue to next result
        counter++;
      });

      // Append all NASA APOD API results to the grid container
      grid.appendChild(fragment);

      // When images are loaded...
      imagesLoaded(grid, function() {
        
        // Fade out loading screen to reveal the NASA APOD API results (vanilla JS version of jQuery's fadeOut effect courtesy of https://stackoverflow.com/questions/48142511/how-do-i-fade-out-a-div-using-pure-javascript)
        var loader = document.querySelector('.loader-wrapper');
        var heading = document.querySelector('#titlehead');
        var credit = document.querySelector('#credit');
        loader.style.transition = '.5s';
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        heading.classList.toggle('hidden');
        credit.classList.toggle('hidden');
        grid.classList.toggle('hidden');

        // Initiate Masonry grid layout
        var msnry = new Masonry( grid, {
          // Masonry grid layout settings
          itemSelector: '.grid-item', // class of items in grid
          columnWidth: '.grid-sizer',
          percentPosition: true, // width is based on viewpoint size rather than pixels
          gutter: 20 // separate grid columns by 20px
        });

        // Add and lay out newly appended elements (results from the API) to the Masonry grid
        msnry.appended(elems);
        msnry.reloadItems();
        msnry.layout();

      }, 1250);
    }
  };


  function createElements(imgurl, counter) {
    /* 
      CREATE ELEMENTS OF EACH RESULT FROM NASA APOD API
    */
    var div_elem = document.createElement('div'); // Entire contents of the result container
    var title_elem = document.createElement('h2'); // title
    var img_elem = document.createElement('img'); // image
    var date_elem = document.createElement('h3'); // date taken
    var div_dl = document.createElement('div'); // date and like buttons container
    var likes_div = document.createElement('div'); // like and unlike buttons container 
    var des_elem = document.createElement('p'); // description
    var like1_div = document.createElement('div'); // like button container
    var like2_div = document.createElement('div'); // unlike button container
    var like_elem = document.createElement('i'); // like button
    var liked_elem = document.createElement('i'); // unlike button

    /* 
      SET ELEMENT PROPERTIES/ATTRIBUTES
    */
    div_elem.className = 'grid-item';
    title_elem.textContent = imgurl.title;
    img_elem.src = imgurl.hdurl;
    img_elem.alt = 'NASA Astronomy Picture of the Day';
    date_elem.textContent = imgurl.date;
    div_dl.id = 'date-like';
    des_elem.textContent = imgurl.explanation;
    like_elem.id = counter;
    liked_elem.id = counter;

    // Determine whether the image has already been liked or not within the current session
    if (window.sessionStorage.getItem(counter) == 1) {
      // image is liked
      like1_div.classList.toggle('hidden');
    }
    else {
      // image is not liked
      like2_div.classList.toggle('hidden');
    }

    // Add Font Awesome class names to like buttons in order for heart icons to appear
    like_elem.className = 'far fa-heart fa-2x';
    liked_elem.className = 'fas fa-heart fa-2x';

    /* 
      ADD ELEMENTS TO APPROPRIATE PARENTS
    */
    div_elem.appendChild(title_elem);
    div_elem.appendChild(img_elem);
    div_dl.appendChild(date_elem);
    like1_div.appendChild(like_elem);
    like2_div.appendChild(liked_elem);
    likes_div.appendChild(like1_div);
    likes_div.appendChild(like2_div);
    div_dl.appendChild(likes_div);
    div_elem.appendChild(div_dl);
    div_elem.appendChild(des_elem);

    // When like button is clicked...
    like_elem.addEventListener('click', () => {
      like_sound.play(); // play like sound effect
      // Hide the like button and replace with unlike button
      like1_div.classList.toggle('hidden');
      like2_div.classList.toggle('hidden');
      window.sessionStorage.setItem(like_elem.id, 1); // mark the image as liked for the current session
    });

    // When unlike button is clicked...
    liked_elem.addEventListener('click', () => {
      unlike_sound.play(); // play unlike sound effect
      // Hide the unlike button and replace with like button
      like1_div.classList.toggle('hidden');
      like2_div.classList.toggle('hidden');
      window.sessionStorage.setItem(liked_elem.id, 0); // mark the image as unliked for the current session
    });

    return div_elem;
  }
});